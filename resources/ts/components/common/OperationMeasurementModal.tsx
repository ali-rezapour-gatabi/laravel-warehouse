import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Loader2, X } from "lucide-react";
import { MeasurementType } from "../Measurement";
import { Input } from "../ui/input";
import { toast } from "../ui/toast";

type MeasurementTypeModal = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    measurement?: any;
    fetchMeasurements: () => void;
}

const OperationMeasurementModal = ({ isOpen, setIsOpen, measurement, fetchMeasurements }: MeasurementTypeModal) => {
    const [form, setForm] = React.useState<MeasurementType>({ id: 0, name: "", symbol: "" });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [errors, setErrors] = React.useState<Partial<Record<keyof MeasurementType, string>>>({});
    const nameInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (!isOpen) {
            setForm({ id: 0, name: "", symbol: "" });
            setErrors({});
            setIsSubmitting(false);
            return;
        }
        if (measurement) {
            setForm({
                id: measurement.id,
                name: measurement.name,
                symbol: measurement.symbol,
            });
        } else {
            setForm({ id: 0, name: "", symbol: "" });
            setErrors({});
            setIsSubmitting(false);
        }
    }, [isOpen, measurement]);

    const validate = () => {
        const nextErrors: typeof errors = {};

        if (!form.name.trim()) {
            nextErrors.name = "لطفاً نام واحد اندازی گیری را وارد کنید.";

        } else if (form.name.trim().length > 100) {
            nextErrors.name = "نام واحد اندازی گیری نباید بیشتر از ۱۰۰ کاراکتر باشد.";
        }

        if (form.symbol.trim().length > 40) {
            nextErrors.symbol = "نماد نباید بیشتر از ۴۰ کاراکتر باشد.";
        }
        if (form.symbol.trim().length <= 0) {
            nextErrors.symbol = "نماد باید حداقل ۱ کاراکتر باشد.";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!validate()) {
            nameInputRef.current?.focus();
            return;
        }
        setIsSubmitting(true);

        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;

            if (!csrfToken) {
                throw new Error("توکن امنیتی صفحه پیدا نشد.");
            }
            const url = measurement ? `/measurement/update` : '/measurement/create';
            const method = measurement ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method: method,
                credentials: 'same-origin',
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    id: measurement?.id,
                    name: form.name,
                    symbol: form.symbol,
                }),
            })
            const data = await res.json();
            if (res.status === 422 && data.errors) {
                const nextErrors: typeof errors = {};
                for (const field of ['name', 'symbol'] as const) {
                    const message = data.errors[field]?.[0];
                    if (message) {
                        nextErrors[field] = message;
                    }
                }
                setErrors(nextErrors);
                if (nextErrors.name) {
                    nameInputRef.current?.focus();
                } else if (Object.keys(nextErrors).length === 0) {
                    setIsOpen(false);
                }
                return;
            }
            if (!res.ok) {
                toast.add({
                    title: data.message ?? 'عملیات واحد اندازی گیری با خطا مواجه شد.',
                    type: 'error',
                    timeout: 2000,
                })
                return;
            }
            if (res.ok) {
                toast.add({
                    title: data.message,
                    type: 'success',
                    timeout: 2000,
                })
                setIsOpen(false);
                fetchMeasurements();
            }
        }
        catch (error) {
            setIsSubmitting(false);
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
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open: any) => { if (!isSubmitting) { setIsOpen(open); } }}>
            <DialogContent dir="rtl" className="gap-0 overflow-hidden rounded-2xl border-border/70 p-0 sm:max-w-lg" showCloseButton={false} >
                <DialogHeader className="relative border-b bg-muted/20 px-6 py-5 text-right sm:text-right">
                    <div className="flex items-center gap-3 justify-between">
                        <DialogTitle className="text-lg font-bold">
                            افزودن واحد اندازی گیری
                        </DialogTitle>

                        <Button type="button" variant="destructive" size="icon" className="size-9 shrink-0 rounded-lg" disabled={isSubmitting} onClick={() => setIsOpen(false)} aria-label="بستن پنجره" >
                            <X className="size-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-5 px-6 py-6">
                        <div className="space-y-2">
                            <label htmlFor="measurement-name" className="text-sm font-medium" >
                                عنوان واحد اندازی گیری <span className="text-destructive"> * </span>
                            </label>
                            <Input
                                ref={nameInputRef}
                                id="measurement-name"
                                name="name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="به عنوان مثال کیلوگرم"
                                autoComplete="off"
                                maxLength={255}
                                disabled={isSubmitting}
                                aria-invalid={!!errors.name}
                                aria-describedby={errors.name ? "measurement-name-error" : undefined}
                                className="h-11 rounded-lg mt-1"
                            />

                            {errors.name && (
                                <p id="measurement-name-error" role="alert" className="text-xs text-destructive" >
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="measurement-symbol" className="text-sm font-medium" >
                                نماد <span className="text-destructive"> * </span>
                            </label>
                            <Input
                                ref={nameInputRef}
                                id="measurement-symbol"
                                name="name"
                                value={form.symbol}
                                onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                                placeholder="به عنوان مثال KG , kg"
                                autoComplete="off"
                                maxLength={40}
                                disabled={isSubmitting}
                                aria-invalid={!!errors.symbol}
                                aria-describedby={errors.symbol ? "measurement-symbol-error" : undefined}
                                className="h-11 rounded-lg mt-1"
                            />

                            {errors.symbol && (
                                <p id="measurement-symbol-error" role="alert" className="text-xs text-destructive" >
                                    {errors.symbol}
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
                            ) : (measurement ? "ویرایش واحد اندازی گیری" : "افزودن واحد اندازی گیری")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default OperationMeasurementModal;
