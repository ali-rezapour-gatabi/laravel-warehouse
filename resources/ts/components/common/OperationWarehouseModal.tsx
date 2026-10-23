
import React from "react";
import { Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "../ui/toast";
import { WarehouseForm } from "../Warehouse";
import { MeasurementSelector } from "./MeasurementSelector";


type WarehouseModalProps = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    wearhouse?: WarehouseForm | null;
    fetchWarehouses: () => void;
};

export default function OperationWarehouseModal({ isOpen, setIsOpen, wearhouse, fetchWarehouses }: WarehouseModalProps) {
    const [form, setForm] = React.useState<WarehouseForm>({
        id: 0,
        name: "",
        description: "",
        quantity: "",
        measurement_id: null,
    });
    const [errors, setErrors] = React.useState<Partial<Record<keyof WarehouseForm, string>>>({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const nameInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (!isOpen) {
            setForm({ id: 0, name: "", description: "", quantity: "", measurement_id: null });
            setErrors({});
            setIsSubmitting(false);
            return;
        }

        if (wearhouse) {
            setForm({
                id: wearhouse.id,
                name: wearhouse.name,
                quantity: wearhouse.quantity ?? "",
                measurement_id: wearhouse.measurement_id,
                description: wearhouse.description ?? "",
            });
        } else {
            setForm({ id: 0, name: "", description: "", quantity: "", measurement_id: null });
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen, wearhouse]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value, }));
        setErrors((prev) => ({ ...prev, [name]: undefined, }));
    };

    const validate = () => {
        const nextErrors: typeof errors = {};

        if (!form.name.trim()) {
            nextErrors.name = "لطفاً نام انبار را وارد کنید.";
        } else if (form.name.trim().length > 100) {
            nextErrors.name = "نام انبار نباید بیشتر از ۱۰۰ کاراکتر باشد.";
        }

        if (form.description && form.description.length > 500) {
            nextErrors.description = "توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد.";
        }

        if (form.quantity?.trim() && !form.measurement_id) {
            nextErrors.measurement_id = "واحد اندازه‌گیری را انتخاب کنید.";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!validate()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;

            if (!csrfToken) {
                throw new Error("توکن امنیتی صفحه پیدا نشد.");
            }

            const url = wearhouse ? `/warehouses/update` : '/warehouses/create';
            const method = wearhouse ? 'PATCH' : 'POST';

            console.log(form)
            const response = await fetch(url, {
                method: method,
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    id: wearhouse?.id,
                    name: form.name,
                    measurement_id: form.measurement_id,
                    quantity: form.quantity,
                    description: form.description || null,
                }),
            });

            const data = await response.json();

            if (response.status === 422 && data.errors) {
                const nextErrors: typeof errors = {};

                for (const field of ["name", "description"] as const) {
                    const message = data.errors[field]?.[0];

                    if (message) {
                        nextErrors[field] = message;
                    }
                }

                setErrors(nextErrors);

                if (nextErrors.name) {
                    nameInputRef.current?.focus();
                } else if (Object.keys(nextErrors).length === 0) {
                    toast.add({
                        title: data.message,
                        description: 'اطلاعات واردشده معتبر نیست.',
                        type: 'error',
                        timeout: 2000,
                    })
                }

                return;
            }

            if (!response.ok) {
                toast.add({
                    title: data.message,
                    description: 'ثبت انبار با خطا مواجه شد.',
                    type: 'error',
                    timeout: 2000,
                })
            }
            if (response.ok) {
                toast.add({
                    title: "انبار اضافه شد",
                    description: "انبار با موفقیت اضافه شد.",
                    type: "success",
                    timeout: 2000,
                })
                setIsOpen(false);
                fetchWarehouses();
            }
        } catch (error) {
            toast.add({
                title: 'خطا در ارتباط با سرور',
                description: error instanceof Error ? error.message : '',
                type: 'error',
                timeout: 2000,
            })
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!isSubmitting) { setIsOpen(open); } }}>
            <DialogContent dir="rtl" className="gap-0 overflow-hidden rounded-2xl border-border/70 p-0 sm:max-w-lg" showCloseButton={false} >
                <DialogHeader className="relative border-b bg-muted/20 px-6 py-5 text-right sm:text-right">
                    <div className="flex items-center gap-3 justify-between">
                        <DialogTitle className="text-lg font-bold">
                            افزودن انبار جدید
                        </DialogTitle>

                        <Button type="button" variant="destructive" size="icon" className="size-9 shrink-0 rounded-lg" disabled={isSubmitting} onClick={() => setIsOpen(false)} aria-label="بستن پنجره" >
                            <X className="size-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-5 px-6 py-6">
                        <div className="space-y-2">
                            <label htmlFor="warehouse-name" className="text-sm font-medium" >
                                عنوان انبار <span className="mr-1 text-destructive"> * </span>
                            </label>
                            <Input
                                ref={nameInputRef}
                                id="warehouse-name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="به عنوان مثال انبار مرکزی"
                                autoComplete="off"
                                maxLength={255}
                                disabled={isSubmitting}
                                aria-invalid={!!errors.name}
                                aria-describedby={errors.name ? "warehouse-name-error" : undefined}
                                className="h-11 rounded-lg mt-1"
                            />

                            {errors.name && (
                                <p id="warehouse-name-error"
                                    role="alert"
                                    className="text-xs text-destructive"
                                >
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="warehouse-quantity" className="text-sm font-medium">
                                ظرفیت انبار
                            </label>

                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    id="warehouse-quantity"
                                    name="quantity"
                                    type="number"
                                    min="0"
                                    value={form.quantity ?? ""}
                                    onChange={(e) => {
                                        const quantity = e.target.value;

                                        setForm((prev) => ({
                                            ...prev, quantity, ...(!quantity.trim() ? { measurement_id: null } : {}),
                                        }));

                                        setErrors((prev) => ({
                                            ...prev,
                                            quantity: undefined,
                                            measurement_id: undefined,
                                        }));
                                    }}
                                    placeholder="ظرفیت"
                                    disabled={isSubmitting}
                                    className="h-11 rounded-lg"
                                />

                                <MeasurementSelector
                                    value={form.measurement_id ? String(form.measurement_id) : ""}
                                    onChange={(measurement) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            measurement_id: measurement?.id ?? null,
                                        }));

                                        setErrors((prev) => ({
                                            ...prev,
                                            measurement_id: undefined,
                                        }));
                                    }}
                                    placeholder="انتخاب واحد"
                                />
                            </div>

                            {errors.measurement_id && (
                                <p className="text-xs text-destructive" role="alert">
                                    {errors.measurement_id}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <label htmlFor="warehouse-description" className="text-sm font-medium">
                                    توضیحات
                                </label>

                                <span className="text-xs text-muted-foreground">
                                    {form.description && form.description.length}/500
                                </span>
                            </div>

                            <Textarea
                                id="warehouse-description"
                                name="description"
                                value={form.description ?? ""}
                                onChange={handleChange}
                                placeholder="توضیحات اختیاری درباره انبار..."
                                maxLength={500}
                                disabled={isSubmitting}
                                aria-invalid={!!errors.description}
                                aria-describedby={errors.description ? "warehouse-description-error" : undefined}
                                className="min-h-28 resize-y rounded-lg"
                            />

                            {errors.description && (
                                <p id="warehouse-description-error" role="alert" className="text-xs text-destructive" >
                                    {errors.description}
                                </p>
                            )}
                        </div>

                    </div>

                    <div className="border-t bg-muted/10 px-6 py-4">
                        <Button type="submit" className="w-full h-11" disabled={isSubmitting} >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="ml-2 size-4 animate-spin" />
                                    در حال ثبت...
                                </>
                            ) : (wearhouse ? "ویرایش انبار" : "افزودن انبار")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
