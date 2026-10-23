import React from "react";
import Wrapper from "./ui/wrapper";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Search, Plus, RefreshCw, AlertCircle, Edit, } from "lucide-react";
import { Input } from "./ui/input";
import { toast } from "./ui/toast";
import { formatDate, formatFaNum } from "@/lib/utils";
import { Switch } from "./ui/switch";
import OperationWarehouseModal from "./common/OperationWarehouseModal";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
import { MeasurementType } from "./Measurement";

export type WarehouseForm = {
    id: number;
    name: string;
    description: string | null;
    is_active?: boolean;
    measurement_id?: number | null;
    measurement?: MeasurementType | null;
    quantity?: string;
    created_at?: string;
    updated_at?: string;
};


export default function Warehouse() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [warehouses, setWarehouses] = React.useState<WarehouseForm[]>([]);
    const [filter, setFilter] = React.useState({
        name: "",
        is_active: "",
    });
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [editWarehouse, setEditWarehouse] = React.useState<WarehouseForm | null>(null);

    const openModalHandler = (warehouse: WarehouseForm | null) => {
        setEditWarehouse(warehouse);
        setIsOpen(true);
    }

    const fetchWarehouses = React.useCallback(async (params: URLSearchParams | null) => {
        setIsLoading(true);
        setError(null);

        try {
            let url = params ? `/warehouses/list?${params.toString()}` : "/warehouses/list";
            const response = await fetch(
                url,
                {
                    method: "GET",
                    credentials: "same-origin",
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            if (response.status === 401 || response.status === 403) {
                window.location.assign("/login");
                return;
            }

            if (!response.ok) {
                throw new Error("دریافت فهرست انبارها ناموفق بود.");
            }

            const result = await response.json();

            if (!result.success || !Array.isArray(result.result?.data)) {
                throw new Error("ساختار پاسخ سرور معتبر نیست.");
            }

            setWarehouses(result.result.data);
        } catch (err) {
            const message = err instanceof Error
                ? err.message
                : "خطای نامشخصی رخ داده است.";

            setError(message);

            toast.add({
                title: "خطا در دریافت اطلاعات",
                description: message,
                type: "error",
                timeout: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    }, []);


    React.useEffect(() => {
        const timeout = window.setTimeout(() => {
            const params = new URLSearchParams();

            if (filter.name.trim()) {
                params.set("name", filter.name.trim());
            }

            if (filter.is_active !== "") {
                params.set("is_active", filter.is_active);
            }

            void fetchWarehouses(params);
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [filter, fetchWarehouses]);


    const handleWarehouseStatusChange = async (id: number, status: boolean) => {
        const res = await fetch('/warehouses/edit/status', {
            method: 'PATCH',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
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
                description: 'با خطا در ارتباط با سرور به روز رسانی انبارها می شوید.',
                type: 'error',
                timeout: 2000,
            })
        }
        else {
            toast.add({
                title: status ? 'انبار فعال شد.' : 'انبار غیرفعال شد.',
                description: 'به روز رسانی انبارها با موفقیت انجام شد.',
                type: 'success',
                timeout: 2000,
            })
            if (warehouses) {
                setWarehouses((prev) =>
                    prev.map((warehouse) => warehouse.id === id ? { ...warehouse, is_active: status } : warehouse)
                );
            }
        }
    }


    return (
        <Wrapper>
            <div dir="rtl" className="mx-auto w-full space-y-6">
                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative">
                                <Search size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    value={filter.name}
                                    onChange={(event) =>
                                        setFilter((prev) => ({ ...prev, name: event.target.value }))
                                    }
                                    placeholder="جست‌وجوی انبار..."
                                    aria-label="جست‌وجوی انبار"
                                    className="h-11 w-full bg-background pr-10 pl-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring sm:w-84"
                                />
                            </div>
                            <Select

                                value={filter.is_active}
                                onValueChange={(value) =>
                                    setFilter((prev: any) => ({ ...prev, is_active: value }))
                                } >
                                <SelectTrigger className="h-11 w-30 rounded-lg">
                                    {filter.is_active === "" ? "وضعیت انبار" : filter.is_active === '1' ? "فعال" : "غیرفعال"}
                                </SelectTrigger>

                                <SelectContent alignItemWithTrigger={false} sideOffset={4}>
                                    <SelectItem value="">همه انبارها</SelectItem>
                                    <SelectItem value="1">فعال</SelectItem>
                                    <SelectItem value="0">غیرفعال</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>



                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => void fetchWarehouses(null)}
                                disabled={isLoading}
                                className="size-11"
                            >
                                <RefreshCw
                                    size={16}
                                    className={isLoading ? "animate-spin" : ""}
                                />
                            </Button>
                            <Button onClick={() => openModalHandler(null)} className="h-11 gap-2 px-5">
                                <Plus size={18} />
                                افزودن انبار جدید
                            </Button>
                        </div>
                    </div>

                    <div className="warehouse-scrollbar w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="h-12 w-16 text-center">ردیف</TableHead>
                                    <TableHead className="h-12 w-38 text-right">نام انبار</TableHead>
                                    <TableHead className="h-12 w-36 text-right">لوکیشن ها</TableHead>
                                    <TableHead className="h-12 w-30 text-right">ظرفیت انبار</TableHead>
                                    <TableHead className="h-12 w-90 text-right">توضیحات</TableHead>
                                    <TableHead className="h-12 w-32 text-right">وضعیت</TableHead>
                                    <TableHead className="h-12 w-40 text-right">آخرین تغییر</TableHead>
                                    <TableHead className="h-12 w-20 text-center">عملیات</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {isLoading && warehouses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-48">
                                            <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                                <RefreshCw
                                                    size={25}
                                                    className="animate-spin text-primary"
                                                />
                                                <span className="text-sm">
                                                    در حال دریافت انبارها...
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : error ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-48">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <AlertCircle
                                                    size={28}
                                                    className="text-destructive"
                                                />
                                                <p className="text-sm text-destructive">
                                                    {error}
                                                </p>
                                                <Button variant="outline" size="sm" onClick={() => void fetchWarehouses(null)} >
                                                    تلاش مجدد
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : warehouses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-56">
                                            <div className="flex flex-col items-center justify-center px-4 text-center">
                                                <p className="mt-4 text-foreground">
                                                    {filter.name.trim() || filter.is_active.trim() ? "انبار ثبت نشده است" : "انباری ثبت نشده است"}
                                                </p>

                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    warehouses.map(
                                        (warehouse, index) => (
                                            <TableRow key={warehouse.id} className="transition-colors hover:bg-muted/30">
                                                <TableCell className="text-center text-xs tabular-nums text-muted-foreground">
                                                    {index + 1}
                                                </TableCell>

                                                <TableCell>
                                                    <p className="font-semibold text-foreground">
                                                        {warehouse.name}
                                                    </p>
                                                </TableCell>

                                                <TableCell>
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        تعریف نشده
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        {warehouse.quantity ? formatFaNum(warehouse.quantity) + ' ' + warehouse.measurement?.symbol : "-"}
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    <p className="max-w-90 truncate text-muted-foreground text-[12px]" title={warehouse.description ?? ""} >
                                                        {warehouse.description || "بدون توضیحات"}
                                                    </p>
                                                </TableCell>

                                                <TableCell>
                                                    <Switch checked={warehouse.is_active} onCheckedChange={() => void handleWarehouseStatusChange(warehouse.id, !warehouse.is_active)} />
                                                </TableCell>

                                                <TableCell>
                                                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
                                                        {formatDate(warehouse.updated_at ?? warehouse.created_at)}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <Button type="button" className="h-9 w-9 rounded-lg" variant="link" onClick={() => openModalHandler(warehouse)}>
                                                        <Edit size={19} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </section>

                <OperationWarehouseModal isOpen={isOpen} setIsOpen={setIsOpen} wearhouse={editWarehouse} fetchWarehouses={() => void fetchWarehouses(null)} />
            </div>
        </Wrapper>
    );
}
