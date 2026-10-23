
import { X, Plus, Trash2, Edit } from "lucide-react";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { MeasurementSelector } from "./MeasurementSelector";
import { toast } from "../ui/toast";
import { formatFaNum } from "@/lib/utils";
import { MeasurementType } from "../Measurement";
import CustomAlert from "../ui/custom-alert";

type LocationModalType = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    wearhouseId: number | null;
    fetchWarehouses: () => void;
};

type WarehouseLocationType = {
    id: number;
    location: string;
    warehouse_id: number;
    measurement_id: any;
    measurement?: MeasurementType | null;
    quantity: string;
};

export const WarehouseLocationModal = ({ isOpen, setIsOpen, wearhouseId, fetchWarehouses }: LocationModalType) => {
    const [form, setForm] = React.useState({
        id: 0,
        location: "",
        quantity: "",
        warehouse_id: wearhouseId,
        measurement_id: null,
    });
    const [locations, setLocations] = React.useState<WarehouseLocationType[]>([]);
    const [error, setError] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [deletedId, setDeletedId] = React.useState<number | null>(null);

    React.useEffect(() => {
        setForm({
            id: 0,
            location: "",
            quantity: "",
            warehouse_id: wearhouseId,
            measurement_id: null,
        });
        setError("");
        setLocations([]);
        fetchLocations();
    }, [wearhouseId]);

    const submitHanlder = async (event: any) => {
        event.preventDefault();
        const name = form.location.trim();

        if (!name) {
            setError("عنوان قفسه را وارد کنید.");
            return;
        }

        if (wearhouseId == null) {
            setError("ابتدا یک انبار انتخاب کنید.");
            return;
        }

        const url = form.id == 0 ? `/warehouse/location/create` : '/warehouse/location/update';
        const method = form.id == 0 ? 'POST' : 'PATCH';
        console.log(url)
        console.log(method)
        try {
            setIsSubmitting(true);
            const res = await fetch(url, {
                method: method,
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: form.id == 0 ? null : form.id,
                    location: form.location,
                    quantity: form.quantity,
                    warehouse_id: wearhouseId,
                    measurement_id: form.measurement_id,
                })
            })
            const data = await res.json();

            const firstError = Object.values(data.errors ?? {}).flat().find((message) => typeof message === "string");

            if (res.ok) {
                toast.add({
                    title: data.message,
                    type: 'success',
                    timeout: 3000,
                })

                setForm({
                    id: 0,
                    location: "",
                    quantity: "",
                    warehouse_id: wearhouseId,
                    measurement_id: null,
                });
                fetchLocations();
            }
            else {
                toast.add({
                    title: data.message,
                    description: firstError,
                    type: 'error',
                    timeout: 4000,
                })
            }

            setError("");

        }
        catch (error) {
            toast.add({
                title: 'خطا در ارتباط با سرور',
                description: error instanceof Error ? error.message : '',
                type: 'error',
                timeout: 2000,
            })
        }
        finally {
            setIsSubmitting(false);
        }
    };

    const fetchLocations = async () => {
        if (wearhouseId == null) return;
        try {
            const params = new URLSearchParams();
            params.set('warehouse_id', wearhouseId.toString());
            const res = await fetch(`/warehouse/location/list?${params.toString()}`, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            const data = await res.json();
            if (!res.ok) {
                toast.add({
                    title: 'خطا در ارتباط با سرور',
                    type: 'error',
                    timeout: 2000,
                })
            }
            else {
                console.log(data)
                setLocations(data.data ?? []);
            }
        }
        catch (error) {
            toast.add({
                title: 'خطا در ارتباط با سرور',
                type: 'error',
                timeout: 2000,
            })
        }

    }


    const handleDelete = async () => {
        const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
        if (!csrfToken) {
            toast.add({
                title: 'خطا در ارتباط با سرور',
                type: 'error',
                timeout: 2000,
            })
            return;
        }
        try {
            const res = await fetch('/warehouse/location/delete', {
                method: 'DELETE',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ id: deletedId })
            })
            res.json().then((data) => {
                if (data.success) {
                    toast.add({
                        title: data.message ?? 'خطا در ارتباط با سرور',
                        type: 'success',
                        timeout: 2000,
                    })
                    setForm({ id: 0, location: "", quantity: "", warehouse_id: wearhouseId, measurement_id: null });
                    setDeletedId(null);
                    fetchLocations();
                    fetchWarehouses()
                }
                else {
                    toast.add({
                        title: data.message ?? 'خطا در ارتباط با سرور',
                        type: 'error',
                        timeout: 2000,
                    })
                }
            })
        }
        catch (error) {
            toast.add({
                title: 'خطا در ارتباط با سرور',
                type: 'error',
                timeout: 2000,
            })
        }

    };

    return (
        <Dialog open={isOpen} onOpenChange={() => { if (!isSubmitting) setIsOpen(false); }} >
            <DialogContent dir="rtl" className="max-h-[85vh] w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-2xl border-border/70 p-0 sm:max-w-4xl" showCloseButton={false}>
                <DialogHeader className="border-b bg-muted/20 px-6 py-5 text-right">
                    <div className="flex items-center justify-between gap-3">
                        <DialogTitle className="text-lg font-bold">
                            مدیریت قفسه‌های انبار
                        </DialogTitle>

                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="size-9 shrink-0 rounded-lg"
                            disabled={isSubmitting}
                            onClick={() => setIsOpen(false)}
                            aria-label="بستن پنجره"
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="max-h-[calc(85vh-80px)] space-y-6 overflow-y-auto p-6">
                    <section className="rounded-xl border bg-card p-4">
                        <form onSubmit={submitHanlder} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="min-w-0 flex-1">
                                <label htmlFor="warehouse-location-name" className="text-sm font-medium">
                                    عنوان قفسه
                                    <span className="mr-1 text-destructive">*</span>
                                </label>

                                <Input
                                    id="warehouse-location-name"
                                    name="location"
                                    value={form.location}
                                    onChange={(event) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            location: event.target.value,
                                        }));
                                        setError("");
                                    }}
                                    placeholder="مثلاً قفسه L3"
                                    autoComplete="off"
                                    maxLength={255}
                                    disabled={isSubmitting}
                                    aria-invalid={!!error}
                                    className="mt-2 h-11 rounded-lg"
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <label htmlFor="warehouse-quantity" className="text-sm font-medium" >
                                    ظرفیت
                                </label>

                                <Input
                                    id="warehouse-quantity"
                                    name="quantity"
                                    type="number"
                                    min="0"
                                    value={form.quantity ?? ""}
                                    onChange={(event) => {
                                        const quantity = event.target.value;

                                        setForm((prev) => ({
                                            ...prev, quantity, ...(!quantity.trim() ? { measurement_id: null } : {}),
                                        }));
                                    }}
                                    placeholder="ظرفیت"
                                    disabled={isSubmitting}
                                    className="mt-2 h-11 rounded-lg"
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <label className="text-sm font-medium"> واحد اندازه‌گیری </label>

                                <div className="mt-2">
                                    <MeasurementSelector
                                        value={
                                            form.measurement_id != null
                                                ? String(form.measurement_id)
                                                : ""
                                        }
                                        onChange={(measurement) => {
                                            setForm((prev: any) => ({
                                                ...prev,
                                                measurement_id: measurement?.id ?? null,
                                            }));
                                        }}
                                        placeholder="انتخاب واحد"
                                    />
                                </div>
                            </div>

                            <Button type="submit" disabled={isSubmitting || wearhouseId == null} className="h-11 shrink-0 gap-2 rounded-lg">
                                {form.id === 0 ? <Plus className="size-4" /> : <Edit className="size-4" />}
                                {form.id === 0 ? 'افزودن' : 'ویرایش'}
                            </Button>
                        </form>

                        {error && (
                            <p role="alert" className="mt-2 text-xs text-destructive">
                                {error}
                            </p>
                        )}
                    </section>

                    <section>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold">
                                قفسه‌های ثبت شده
                            </h3>

                            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                                {new Intl.NumberFormat("fa-IR").format(locations.length)} قفسه
                            </span>
                        </div>

                        {locations == null || locations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-10 text-center">

                                <p className="text-sm font-medium">
                                    هنوز قفسه‌ای تعریف نشده است
                                </p>

                            </div>
                        ) : (
                            <div className="space-y-2 grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-120 overflow-y-auto">
                                {locations.map((item, index) => (
                                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/30" >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                                                {new Intl.NumberFormat("fa-IR").format(index + 1)}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {item.location}
                                                </p>
                                            </div>
                                            {item.quantity &&
                                                <div className='border-r px-2 text-xs'>
                                                    ظرفیت :
                                                    {item.quantity ? formatFaNum(item.quantity) + ' ' + item.measurement?.symbol : ""}
                                                </div>
                                            }
                                        </div>

                                        <div className="flex items-center">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-9 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                onClick={() => setDeletedId(item.id)}
                                                aria-label={`حذف ${item.location}`}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                            {form.id === item.id &&
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-9 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive bg-destructive/20"
                                                    onClick={() => setForm({ id: 0, location: "", quantity: "", warehouse_id: wearhouseId, measurement_id: null })}
                                                >
                                                    <X className="size-4" />
                                                </Button>
                                            }
                                            {form.id !== item.id &&
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-9 shrink-0"
                                                    onClick={() => setForm({ id: item.id, location: item.location, quantity: item.quantity, warehouse_id: wearhouseId, measurement_id: item.measurement_id })}
                                                >
                                                    <Edit size={19} />
                                                </Button>
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </DialogContent >
            <CustomAlert
                open={deletedId !== null}
                onOpenChange={(open) => {
                    if (!open) setDeletedId(null);
                }}
                onConfirm={handleDelete}
                title="حذف قفسه"
                description="آیا از حذف این قفسه اطمینان دارید؟ این عملیات ممکن است قابل بازگشت نباشد."
                confirmText="بله، حذف شود"
                cancelText="انصراف"
                variant="destructive"
            />
        </Dialog >
    );
};
