const soldItems = [
  "/images/sold-1.jpg",
  "/images/sold-2.jpg",
  "/images/sold-3.jpg",
  "/images/sold-4.jpg",
  "/images/sold-5.jpg",
  "/images/sold-6.jpg",
  "/images/sold-7.jpg",
  "/images/sold-8.jpg",
  "/images/sold-9.jpg",
  "/images/sold-10.jpg",
  "/images/sold-11.jpg",
];

const doubled = [...soldItems, ...soldItems];

const FloatingResults = () => {
  return (
    <div className="relative w-full py-6 sm:py-10 overflow-x-clip overflow-y-visible">
      <div className="relative w-full overflow-x-clip overflow-y-visible">
        <div
          className="flex gap-5 sm:gap-7 w-max will-change-transform animate-[scroll-left_60s_linear_infinite]"
          style={{ backfaceVisibility: "hidden" }}
        >
          {doubled.map((img, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[120px] sm:w-[150px] md:w-[160px] animate-[float_3s_ease-in-out_infinite]"
              style={{
                animationDelay: `${(i % soldItems.length) * 0.3}s`,
                animationDuration: `${3 + (i % 4) * 0.6}s`,
              }}
            >
              <div className="rounded-t-3xl rounded-b-lg overflow-hidden shadow-2xl shadow-primary/10 border border-border/20">
                <img
                  src={img}
                  alt="Articolo venduto"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FloatingResults;
