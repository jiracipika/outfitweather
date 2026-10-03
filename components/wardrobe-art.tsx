import type { OutfitPiece, StyledLook } from "@/lib/outfit-styling"

/** Local vector garments follow the actual recommendation, including weather protection. */
export default function WardrobeArt({ look, active }: { look: StyledLook; active?: OutfitPiece["kind"] | null }) {
  const find = (kind: OutfitPiece["kind"]) => look.pieces.find(piece => piece.kind === kind)
  const dress = find("dress")
  const shorts = find("bottom")?.label.includes("shorts")
  const boots = find("shoes")?.label.includes("boots")
  const layer = find("layer")
  const longSleeves = /sleeve|knit|sweater|cardigan|thermal|overshirt/i.test(find("top")?.label ?? "")
  const accessory = find("accessory")?.label ?? ""
  const style = (kind: OutfitPiece["kind"]) => ({ opacity: active && active !== kind ? .28 : 1 })
  return <svg viewBox="0 0 300 360" className="atelier-garments" aria-hidden="true">
    <ellipse cx="157" cy="324" rx="102" ry="12" fill="#27392e" opacity=".06" />
    <g className="atelier-garment-top atelier-art-piece" style={style(dress ? "dress" : "top")} stroke="#465047" strokeWidth="1.2" strokeLinejoin="round">
      {dress ? <><path d="M126 40 139 36Q157 51 175 36L188 40 210 78 193 92 178 72 177 121 222 277Q157 300 92 277L137 121 136 72 121 92 104 78Z" fill={look.palette[0]} /><path d="M141 40Q157 65 173 40M138 122H176M157 126V282M126 167 108 269M188 167 206 269" fill="none" opacity=".4" /></> : <><path d={longSleeves ? "M120 44 139 35Q157 48 175 35L194 44 222 137 203 142 184 79V153Q157 160 130 153V79L111 142 92 137Z" : "M120 44 139 35Q157 48 175 35L194 44 226 84 205 102 184 79V153Q157 160 130 153V79L109 102 88 84Z"} fill={look.palette[0]} /><path d="M140 38Q157 69 174 38M134 145H180" fill="none" opacity=".45" /><path d="M133 75Q158 82 181 75M133 133Q158 139 181 133" fill="none" opacity=".12" />{find("top")?.label.match(/blouse|shirt|polo/) && <path d="M157 55V151M142 37 149 65 157 55 166 65 173 37" fill="none" opacity=".5" />}</>}
    </g>
    {!dress && <g className="atelier-garment-bottom atelier-art-piece" style={style("bottom")} fill={look.palette[2]} stroke="#465047" strokeWidth="1.2" strokeLinejoin="round">
      <path d={shorts ? "M131 171H183L191 223 164 226 157 198 150 226 123 223Z" : "M131 171H183L196 289 165 292 157 213 149 292 118 289Z"} />
      <path d={shorts ? "M132 178H182M157 179V198M135 182 130 194M179 182 184 194" : "M132 179H182M157 180V213M135 184 129 202M179 184 185 202M124 282 145 284M170 284 190 282"} fill="none" stroke="#fff" opacity=".3" />
    </g>}
    {layer && <g className="atelier-garment-layer atelier-art-piece" style={style("layer")} stroke="#465047" strokeWidth="1.2" strokeLinejoin="round" transform="rotate(-11 62 186)">
      <path d={/coat/.test(layer.label) ? "M40 105 51 100 64 110 77 100 90 105 107 160 93 165 86 135 88 258H40L42 135 35 165 21 160Z" : "M40 105 51 100 64 110 77 100 90 105 107 160 93 165 86 135 88 218H40L42 135 35 165 21 160Z"} fill={look.palette[1]} />
      <path d="M51 103 56 128 64 115 72 128 77 103M64 115V215M43 177H56M73 177H85" fill="none" opacity=".45" />
      {/Insulated/.test(layer.label) && <path d="M43 146H61M67 146H86M43 164H61M67 164H86M42 191H61M67 191H87M41 208H61M67 208H87" fill="none" opacity=".25" />}
    </g>}
    <g className="atelier-garment-shoes atelier-art-piece" style={style("shoes")} stroke="#465047" strokeWidth="1.3" strokeLinejoin="round" fill={boots ? look.palette[2] : "#f9f3e6"}>
      <path d={boots ? "M206 266H230V293L250 304V316H203Z" : "M204 294H228L249 305V316H200Z"} /><path d={boots ? "M237 253H261V280L281 291V303H234Z" : "M235 281H259L280 292V303H231Z"} />
      <path d="M203 311H248M234 298H279" fill="none" stroke={boots ? "#f9f3e6" : "#465047"} opacity=".5" />
    </g>
    <g className="atelier-garment-accessory atelier-art-piece" style={style("accessory")} stroke="#465047" strokeWidth="1.5" strokeLinejoin="round" transform="translate(225 154) rotate(9)">
      {accessory.includes("umbrella") ? <><path d="M-7 24Q18-14 43 24Z" fill={look.palette[0]} /><path d="M18 24V73Q18 85 7 77M18-2V24M3 24Q8 4 18 0Q30 6 32 24" fill="none" /></> : accessory.includes("Scarf") ? <><path d="M2 0H22V64H7L7 21H2Z" fill={look.palette[0]} /><path d="M9 12H20M9 18H20M9 55H20M9 60H20" opacity=".3" /></> : accessory.includes("Sunglasses") ? <><path d="M-5 10H40M12 14H23" fill="none" /><path d="M-2 10H12V22Q4 31-2 22ZM23 10H37V22Q31 31 23 22Z" fill={look.palette[2]} /></> : <><path d="M0 20H38L42 63H-4Z" fill={look.palette[1]} /><path d="M7 25V12Q19-2 31 12V25" fill="none" /></>}
    </g>
    <g fill="#7a806f" opacity=".5"><path d="M51 42V58M43 50H59M249 105V117M243 111H255" stroke="currentColor" /><circle cx="261" cy="43" r="2" /><circle cx="58" cy="294" r="2" /></g>
  </svg>
}
