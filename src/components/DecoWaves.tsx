const DecoWaves = ({ side }: { side: "left" | "right" }) => {
  const isLeft = side === "left";
  return (
    <div className={`deco-wave ${isLeft ? "left-0" : "right-0"}`}>
      <svg viewBox="0 0 160 700" fill="none" className="w-full h-full">
        {isLeft ? (
          <>
            <path d="M140,700 C80,580 10,520 60,430 C110,340 160,290 110,200 C60,110 0,70 50,10" stroke="#c0c0c0" strokeWidth="1.4" />
            <path d="M120,700 C60,580 -10,520 40,430 C90,340 140,290 90,200 C40,110 -20,70 30,10" stroke="#d0d0d0" strokeWidth="1.2" />
            <path d="M100,700 C40,580 -30,520 20,430 C70,340 120,290 70,200 C20,110 -40,70 10,10" stroke="#ddd" strokeWidth="1" />
            <path d="M80,700 C20,580 -50,520 0,430 C50,340 100,290 50,200 C0,110 -60,70 -10,10" stroke="#e8e8e8" strokeWidth="1" />
          </>
        ) : (
          <>
            <path d="M20,700 C80,580 150,520 100,430 C50,340 0,290 50,200 C100,110 160,70 110,10" stroke="#c0c0c0" strokeWidth="1.4" />
            <path d="M40,700 C100,580 170,520 120,430 C70,340 20,290 70,200 C120,110 180,70 130,10" stroke="#d0d0d0" strokeWidth="1.2" />
            <path d="M60,700 C120,580 190,520 140,430 C90,340 40,290 90,200 C140,110 200,70 150,10" stroke="#ddd" strokeWidth="1" />
            <path d="M80,700 C140,580 210,520 160,430 C110,340 60,290 110,200 C160,110 220,70 170,10" stroke="#e8e8e8" strokeWidth="1" />
          </>
        )}
      </svg>
    </div>
  );
};

export default DecoWaves;
