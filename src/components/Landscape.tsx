export function Landscape({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 900 440"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x2="0" y2="440" gradientUnits="userSpaceOnUse">
          <stop stopColor="#153f35" />
          <stop offset="1" stopColor="#32674a" />
        </linearGradient>
        <linearGradient
          id="river"
          x2="680"
          y2="440"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#83b6a1" />
          <stop offset="1" stopColor="#488a74" />
        </linearGradient>
        <pattern id="crop" width="26" height="20" patternUnits="userSpaceOnUse">
          <path
            d="m5 17 3-9 3 9M8 13l-5-4m5 2 5-5"
            stroke="#d4cb78"
            strokeWidth="1"
            opacity=".4"
          />
        </pattern>
      </defs>
      <path fill="url(#sky)" d="M0 0h900v440H0z" />
      <circle cx="704" cy="89" r="41" fill="#e6cf88" />
      <path
        d="M0 192 155 146l180 57 189-65 215 47 161-35v290H0"
        fill="#416e48"
      />
      <path
        d="m0 240 190-42 157 36 165-36 185 37 203-38v243H0"
        fill="#718849"
      />
      <path
        d="M475 188c-60 53 110 61 41 97S279 345 345 440h170c-99-67 103-86 116-138s-142-61-96-114"
        fill="url(#river)"
      />
      <path
        d="M0 310 404 228M0 396l427-125m-188 169 191-137M656 236l244 32m-245 12 245 68m-280-25 205 117"
        stroke="#c9bb6b"
        strokeWidth="3"
        opacity=".6"
      />
      <path
        fill="url(#crop)"
        d="m0 250 400-20-80 210H0zm670 0 230-28v218H650z"
      />
      <g transform="translate(159 172)">
        <path d="m-30 42 112-59 114 64-114 64z" fill="#243e32" />
        <path d="M0 29 82-14l84 47v75l-84 44L0 105z" fill="#ddd2a5" />
        <path d="m0 29 82 46 84-42v75l-84 44L0 105z" fill="#c1bb90" />
        <path d="M82 75v77l84-44V33" fill="#9cac8c" />
        <path d="m-14 30 95-56 101 56-99 53z" fill="#2a5146" />
        <path
          d="m0 26 82 46 82-39M18 18l82 45m-64-55 82 45m-64-55 82 45"
          stroke="#6b8e75"
          strokeWidth="2"
        />
        <path d="m20 69 35 20v54l-35-20z" fill="#466357" />
        <path d="m105 85 33-18v29l-33 18z" fill="#496d5d" />
      </g>
      <g fill="#1f503d">
        <path d="m730 197-7-101-7 101z" />
        <path d="M724 100c-61-40-67-14-30-4-43 7-42 34 2 14-16 35 1 41 24 0 19 41 39 34 18 0 47 21 52-7 9-17 40-18 22-36-23 7z" />
        <path d="m787 215-5-79-5 79z" />
        <path d="M782 138c-44-39-53-19-26-6-38-1-37 23-5 13-17 27-1 34 22 2 14 31 32 28 16 0 35 17 42-4 9-15 30-12 16-30-16 6z" />
      </g>
      <path d="m509 349 63 12-21 17-50-11z" fill="#e2cd8d" />
      <path d="m537 355 4-37" stroke="#e2cd8d" strokeWidth="3" />
      <path d="m541 318 26 35h-29z" fill="#e8dcae" />
      <path d="M0 440h900" stroke="#e1c56a" strokeWidth="3" />
    </svg>
  );
}
