import IMask from "imask";

interface PhoneDisplayProps {
  phone: string;
  className?: string;
}

export const PhoneDisplay = ({ phone, className = "" }: PhoneDisplayProps) => {
  if (!phone) return <span className={className}>-</span>;

  const formatPhone = (phoneNumber: string): string => {
    const cleanPhone = phoneNumber.replace(/\D/g, "");

    if (cleanPhone.length < 10) return phoneNumber;

    const phonePipe = IMask.createPipe({
      mask: [
        {
          mask: "(00) 0000-0000",
        },
        {
          mask: "(00) 00000-0000",
        },
      ],
    });

    return phonePipe(cleanPhone);
  };

  return <span className={className}>{formatPhone(phone)}</span>;
};
