export default function NotificationIcon({ color, className }) {
  return (
    <div
      className={`${className} flex items-center justify-center bg-transparent px-4 py-14`}
    >
      <div
        style={{ backgroundColor: color, opacity: "24%" }}
        className="flex h-7 w-7 items-center justify-center rounded-full"
      ></div>
      <div className="absolute flex h-4 w-4 items-center justify-center rounded-full bg-white">
        <div
          style={{ backgroundColor: color }}
          className="h-2 w-2 rounded-full"
        ></div>
      </div>
    </div>
  );
}
