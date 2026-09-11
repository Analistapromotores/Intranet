/* Elementos gráficos de Promotores Mi Cali Bella:
   la silueta urbana de Cali (presente en el logosímbolo) y la hoja de la gama verde. */

export function Skyline(props) {
  return (
    <svg viewBox="0 0 900 150" fill="none" preserveAspectRatio="xMidYMax meet" {...props}>
      <g stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        {/* edificios a la izquierda */}
        <path d="M20 150v-52h26v52M46 150v-38h22v38M68 150v-64h20v64M88 150v-30h24v30" />
        <path d="M120 150V72h30v78M150 150v-46h26v46" />
        {/* torre alta */}
        <path d="M196 150V36h34v114M206 46h14M206 60h14M206 74h14M206 88h14M206 102h14" />
        {/* Cristo Rey sobre la colina */}
        <path d="M300 150c14-26 34-40 58-40s44 14 58 40" />
        <path d="M358 110V62M340 78h36M358 62a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
        {/* más ciudad */}
        <path d="M440 150v-42h28v42M468 150v-58h24v58M492 150v-34h30v34" />
        <path d="M556 150V58h32v92M566 70h12M566 86h12M566 102h12M566 118h12" />
        <path d="M596 150v-44h26v44M622 150v-26h28v26" />
        {/* árboles */}
        <path d="M690 150v-24M690 126c-12 0-20-9-20-20s9-18 20-18 20 8 20 18-8 20-20 20Z" />
        <path d="M744 150v-18M744 132c-9 0-16-7-16-15s7-14 16-14 16 6 16 14-7 15-16 15Z" />
        <path d="M790 150v-30h26v30M816 150v-44h22v44M838 150v-22h28v22" />
      </g>
    </svg>
  )
}

export function Hoja(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M20.5 3.5c-8 0-14.5 3.4-14.5 11a6.5 6.5 0 0 0 6.5 6.5c6.6 0 9.9-8.8 8-17.5Z"
        fill="currentColor"
        opacity=".18"
      />
      <path
        d="M20.5 3.5c-8 0-14.5 3.4-14.5 11a6.5 6.5 0 0 0 6.5 6.5c6.6 0 9.9-8.8 8-17.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 19C11.6 12.6 15.6 8.2 19.8 6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}
