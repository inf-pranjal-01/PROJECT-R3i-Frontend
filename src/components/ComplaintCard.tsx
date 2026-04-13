import { flagColorClass, statusLabel, timeAgo } from "../lib/helpers";

interface ComplaintCardProps {
  complaint: any;
  flagField: "studentFlag" | "adminFlag";
  onClick: () => void;
  subtitle?: string;
}

const ComplaintCard = ({ complaint, flagField, onClick, subtitle }: ComplaintCardProps) => {
  const flag = complaint[flagField] || "yellow";
  const status = statusLabel(complaint.status);
  const time = timeAgo(complaint.lastUpdated || complaint.createdAt);

  return (
    <div
      onClick={onClick}
      className="border-[2.5px] border-foreground rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg bg-background"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-sm">{complaint.trackingId}</span>
        <div className={`w-3 h-3 rounded-full ${flagColorClass(flag)}`} />
      </div>
      <div className="border border-foreground rounded-lg px-3 py-1.5 text-center text-xs font-semibold mb-2 inline-block">
        {status}
      </div>
      <div className="border border-foreground rounded-lg px-3 py-2 text-center text-sm font-medium mt-1">
        {complaint.shortTitle?.toUpperCase() || "COMPLAINT"}
      </div>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 text-center italic">
          "{subtitle}"
        </p>
      )}
      <p className="text-[0.7rem] text-muted-foreground mt-3 text-center">{time}</p>
    </div>
  );
};

export default ComplaintCard;
