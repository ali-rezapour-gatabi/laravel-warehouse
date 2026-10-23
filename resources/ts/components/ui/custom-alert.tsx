import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

type ConfirmDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void | Promise<void>;
    title?: string;
    description?: ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: "destructive" | "default";
    isLoading?: boolean;
    disabled?: boolean;
};

export default function CustomAlert({
    open,
    onOpenChange,
    onConfirm,
    title = "آیا مطمئن هستید؟",
    description = "آیا از انجام این عملیات اطمینان دارید؟",
    confirmText = "تأیید",
    cancelText = "انصراف",
    variant = "destructive",
    isLoading = false,
    disabled = false,
}: ConfirmDialogProps) {
    const isDestructive = variant === "destructive";
    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => { if (isLoading) return; onOpenChange(nextOpen); }}>
            <DialogContent dir="rtl" className="max-w-md rounded-2xl border-border p-0 shadow-2xl">
                <DialogHeader className="gap-4 p-6 pb-2">
                    <div className={"flex w-full size-12 items-center justify-center rounded-xl text-destructive"} >
                        <AlertTriangle size={24} />
                    </div>
                    <DialogTitle className="text-center text-lg font-bold"> {title} </DialogTitle>
                    <DialogDescription className="text-center text-[11px] leading-7"> {description} </DialogDescription>
                </DialogHeader>

                <div className="flex justify-center gap-2 border-t bg-muted/20 p-4">
                    <Button
                        type="button"
                        disabled={disabled || isLoading}
                        onClick={() => void handleConfirm()}
                        className={`h-10 min-w-24 gap-2 ${isDestructive ? "bg-destructive/80 hover:bg-destructive/90" : ""}`} >
                        {isLoading && (<Loader2 size={16} className="animate-spin" />)}

                        {isLoading ? "در حال انجام..." : confirmText}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        disabled={isLoading}
                        onClick={() => onOpenChange(false)}
                        className="h-10 min-w-24"
                    >
                        {cancelText}
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    );

}
