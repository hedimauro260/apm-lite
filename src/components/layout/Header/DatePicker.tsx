import { CalendarPopover } from '../../ui/CalendarPopover';

export interface DatePickerProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    activeDates?: string[];
    onActiveDateClick?: (date: Date) => void; // Novo prop
}

export function DatePicker({ selectedDate, onDateChange, activeDates, onActiveDateClick }: DatePickerProps) {
    return (
        <div className="flex items-center">
            <CalendarPopover
                selectedDate={selectedDate}
                onDateChange={onDateChange}
                activeDates={activeDates}
                onActiveDateClick={onActiveDateClick}
            />
        </div>
    );
}