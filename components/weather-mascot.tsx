import type { SceneKey } from "@/lib/weather-scene";

/** A tiny, local illustration. No network request needed for a little sunshine. */
export default function WeatherMascot({
  scene = "clear-day",
}: {
  scene?: SceneKey;
}) {
  const wet = scene === "rain" || scene === "thunder";
  const night = scene === "clear-night";
  return (
    <svg
      viewBox="0 0 300 200"
      fill="none"
      className="weather-mascot"
      aria-hidden="true"
    >
      <ellipse cx="151" cy="181" rx="89" ry="8" fill="#806657" opacity=".08" />
      <g className="mascot-sun">
        {night ? (
          <path
            d="M204 28a43 43 0 1 0 49 56 37 37 0 0 1-49-56Z"
            fill="#c4b7df"
            stroke="#85739f"
            strokeWidth="2"
          />
        ) : (
          <>
            <g stroke="#caa14e" strokeWidth="3" strokeLinecap="round">
              <path d="M207 11v10m0 100v10m60-60h-10m-100 0h-10m18-42 8 8m68 68 8 8m0-84-8 8m-68 68-8 8" />
            </g>
            <circle
              cx="207"
              cy="71"
              r="39"
              fill="#f7cc67"
              stroke="#caa14e"
              strokeWidth="2"
            />
          </>
        )}
      </g>
      <g className="mascot-cloud">
        <path
          d="M75 155c-49 0-52-62-11-68 0-49 66-63 89-22 29-18 66 0 65 32 42 1 45 58 4 58H75Z"
          fill={wet ? "#ddd9ed" : "#fffdf5"}
          stroke="#94867c"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M115 112v7m40-7v7"
          stroke="#62554f"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M126 127q9 10 18 0"
          stroke="#62554f"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <ellipse cx="104" cy="127" rx="9" ry="5" fill="#eeb0a6" />
        <ellipse cx="166" cy="127" rx="9" ry="5" fill="#eeb0a6" />
      </g>
      {wet && (
        <g stroke="#8a9fc0" strokeWidth="4" strokeLinecap="round">
          <path d="m92 165-5 10m47-10-5 10m47-10-5 10" />
        </g>
      )}
      {scene === "snow" && (
        <g fill="#8a9fc0">
          <text x="85" y="180" fontSize="24">
            ✳︎
          </text>
          <text x="170" y="182" fontSize="24">
            ✳︎
          </text>
        </g>
      )}
      <g fill="#b092b7">
        <path d="m35 48 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" />
        <path d="m260 136 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" />
      </g>
    </svg>
  );
}
