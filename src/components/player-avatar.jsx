export function PlayerAvatar({ src, name, size = "md" }) {
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-lg",
    lg: "w-20 h-20 text-2xl",
  };
  const sizeClass = sizes[size] ?? sizes.md;

  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <div className={`${sizeClass} relative rounded-full mx-auto`}>
        <img
          src={src}
          alt={name}
          className={`${sizeClass} rounded-full object-cover`}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        <div
          className={`${sizeClass} rounded-full bg-gray-200 items-center justify-center font-bold text-gray-500 absolute inset-0`}
          style={{ display: "none" }}
        >
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 mx-auto`}
    >
      {initials}
    </div>
  );
}
