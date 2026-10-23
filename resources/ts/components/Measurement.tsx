import Wrapper from "./ui/wrapper";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Edit, Plus, RefreshCw, Trash, } from "lucide-react";
import { Button } from "./ui/button";
import React from "react";
import OperationMeasurementModal from "./common/OperationMeasurementModal";
import { toast } from "./ui/toast";
import { Switch } from "./ui/switch";
import { formatDate } from "@/lib/utils";
import CustomAlert from "./ui/custom-alert";

export type MeasurementType = {
    id: number;
    name: string;
    symbol: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export default function Measurement() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [openModal, setOpenModal] = React.useState(false);
    const [measurements, setMeasurements] = React.useState<MeasurementType[]>([]);
    const [editMeasurement, setEditMeasurement] = React.useState<MeasurementType | null>(null);
    const [deletedId, setDeletedId] = React.useState<number | null>(null);

    const fetchMeasurements = async () => {
        setIsLoading(true);
        try {

            const result = await fetch('/measurements/list', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            const data = await result.json();
            if (!result.ok) {
                toast.add({
                    title: 'خطا در ارتباط با سرور',
                    description: data.message ?? 'با خطا در ارتباط با سرور به روز رسانی اطلاعات واحد های اندازی گیری می شوید.',
                    type: 'error',
                    timeout: 2000,
                })
            }
            else {
                setMeasurements(data.data ?? []);
            }

        } catch (err) {
            toast.add({
                title: 'خطا در ارتباط با سرور',
                description: err instanceof Error ? err.message : '',
                type: 'error',
                timeout: 2000,
            })
        }
        finally {
            setIsLoading(false);
        }
    }


    const openModalHandler = (measurement: MeasurementType | null) => {
        setEditMeasurement(measurement);
        setOpenModal(true);
    }
    const handleMeasurementStatusChange = async (id: number, status: boolean) => {

        const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
        if (!csrfToken) {
            throw new Error("توکن امنیتی صفحه پیدا نشد.");
        }

        const res = await fetch('/measurement/edit/status', {
            method: 'PATCH',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify({
                id,
                is_active: status,
            })
        })
        const data = await res.json();
        if (!res.ok) {
            toast.add({
                title: data.message ?? 'خطا در ارتباط با سرور',
                description: 'با خطا در ارتباط با سرور به روز رسانی اطلاعات واحدهای اندازه‌گیری می شوید.',
                type: 'error',
                timeout: 2000,
            })
        }
        else {
            toast.add({
                title: status ? 'واحد اندازی گیری فعال شد.' : 'واحد اندازی گیری غیرفعال شد.',
                description: 'به روز رسانی اطلاعات واحدهای اندازه‌گیری با موفقیت اضافه شد.',
                type: 'success',
                timeout: 2000,
            })
            if (measurements) {
                setMeasurements((prev) =>
                    prev.map((measurement) => measurement.id === id ? { ...measurement, is_active: status } : measurement)
                );
            }
        }
    }

    const handleDelete = async () => {
        setIsLoading(true);
        const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
        if (!csrfToken) {
            toast.add({
                title: 'خطا در ارتباط با سرور',
                description: 'با خطا در ارتباط با سرور به روز رسانی اطلاعات واحدهای اندازه‌گیری می شوید.',
                type: 'error',
                timeout: 2000,
            })
        }
        else {
            try {

                const res = await fetch('/measurement/delete', {
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
                            description: 'واحد اندازی گیری با موفقیت حذف شد.',
                            type: 'success',
                            timeout: 2000,
                        })
                        setDeletedId(null);
                        fetchMeasurements();
                    }
                    else {
                        toast.add({
                            title: data.message ?? 'خطا در ارتباط با سرور',
                            description: 'با خطا در ارتباط با سرور به روز رسانی اطلاعات واحدهای اندازه‌گیری می شوید.',
                            type: 'error',
                            timeout: 2000,
                        })
                    }
                })
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
                setIsLoading(false);
            }
        }
    }


    React.useEffect(() => {
        void fetchMeasurements();
    }, []);

    return (
        <Wrapper>
            <div dir="rtl" className="mx-auto w-full space-y-6">
                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-base font-bold text-foreground">
                            فهرست واحد های اندازی گیری
                        </h2>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button type="button" variant="outline" disabled={isLoading} className="size-11" onClick={() => void fetchMeasurements()}>
                                <RefreshCw
                                    size={16}
                                    className={isLoading ? "animate-spin" : ""}
                                />
                            </Button>
                            <Button className="h-11 gap-2 px-5" onClick={() => openModalHandler(null)}>
                                <Plus size={18} />
                                افزودن واحد اندازی گیری
                            </Button>
                        </div>
                    </div>

                    <div className="warehouse-scrollbar w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="h-12 w-16 text-center">ردیف</TableHead>
                                    <TableHead className="h-12 w-26 text-center">نام واحد</TableHead>
                                    <TableHead className="h-12 w-26 text-center">نماد</TableHead>
                                    <TableHead className="h-12 w-20 text-center">وضعیت</TableHead>
                                    <TableHead className="h-12 w-40 text-center">آخرین تغییر</TableHead>
                                    <TableHead className="h-12 w-20 text-center">عملیات</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {isLoading && measurements.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                                <RefreshCw
                                                    size={25}
                                                    className="animate-spin text-primary"
                                                />
                                                <span className="text-sm">
                                                    در حال دریافت اطلاعات واحدهای اندازه‌گیری...
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    measurements.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-center">{index + 1}</TableCell>
                                            <TableCell className="text-center">{item.name}</TableCell>
                                            <TableCell className="text-center">{item.symbol}</TableCell>
                                            <TableCell className="text-center">
                                                <Switch checked={item.is_active} onCheckedChange={() => void handleMeasurementStatusChange(item.id, !item.is_active)} />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {formatDate(item.updated_at) ?? "-"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button type="button" className="h-9 w-9 rounded-lg" variant="link" onClick={() => openModalHandler(item)}>
                                                    <Edit size={19} />
                                                </Button>
                                                <Button className='h-9 w-9' variant='ghost' onClick={() => setDeletedId(item.id)}>
                                                    <Trash size={19} className="text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </section>

                <OperationMeasurementModal isOpen={openModal} setIsOpen={setOpenModal} measurement={editMeasurement} fetchMeasurements={fetchMeasurements} />
                <CustomAlert
                    open={deletedId !== null}
                    onOpenChange={(open) => {
                        if (!open) setDeletedId(null);
                    }}
                    onConfirm={handleDelete}
                    title="حذف واحد اندازه‌گیری"
                    description="آیا از حذف این واحد اندازه‌گیری اطمینان دارید؟ این عملیات ممکن است قابل بازگشت نباشد."
                    confirmText="بله، حذف شود"
                    cancelText="انصراف"
                    variant="destructive"
                    isLoading={isLoading}
                />

            </div>
        </Wrapper>
    );
}
