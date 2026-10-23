import * as React from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MeasurementType } from "../Measurement";
import { toast } from "../ui/toast";

type MeasurementSelectorProps = {
    value?: string;
    onChange: (measurement: MeasurementType | null) => void;
    placeholder?: string;
};

export function MeasurementSelector({ value, onChange, placeholder = "انتخاب واحد اندازه‌گیری" }: MeasurementSelectorProps) {
    const [items, setItems] = React.useState<MeasurementType[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        const fetchMeasurements = async () => {
            setIsLoading(true);


            try {
                const response = await fetch(`/measurements/list`, {
                    method: "GET",
                    credentials: "same-origin",
                    headers: {
                        Accept: "application/json",
                    },
                });

                if (!response.ok) {
                    toast.add({
                        title: "خطا در ارتباط با سرور",
                        description: response.statusText,
                        type: "error",
                        timeout: 2000,
                    });
                }

                const result = await response.json();
                const measurements: MeasurementType[] = result.data ?? result.result ?? [];
                setItems(measurements.filter(Boolean));

            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchMeasurements();
    }, []);

    const handleChange = (selectedId: string | null) => {
        const selectedMeasurement = items.find((item) => String(item.id) === selectedId) ?? null;

        onChange(selectedMeasurement);
    };

    const selectedItem = React.useMemo(() => {
        if (value == null || value === "") return undefined;

        return items.find((item) => String(item.id) === String(value));
    }, [items, value]);


    return (
        <Select value={value ?? ""} onValueChange={handleChange} disabled={isLoading}>
            <SelectTrigger className="h-11 w-full rounded-lg">
                <SelectValue placeholder={isLoading ? "در حال دریافت اطلاعات..." : placeholder} >
                    {selectedItem ? `${selectedItem.name} (${selectedItem.symbol})` : undefined}
                </SelectValue>
            </SelectTrigger>

            <SelectContent alignItemWithTrigger={false} sideOffset={4}>
                <SelectGroup>
                    {items.map((item) => (
                        <SelectItem
                            className='cursor-pointer py-2 text-xs'
                            key={item.id}
                            value={String(item.id)}
                        >
                            {item.name} ({item.symbol})
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );

}
