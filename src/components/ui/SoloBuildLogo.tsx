import React from 'react';

interface SoloBuildLogoProps {
  height?: number;
}

const SoloBuildLogo: React.FC<SoloBuildLogoProps> = ({ height = 52 }) => (
  <img
    src="/solobuild-logo.png"
    alt="SoloBuildAI"
    height={height}
    style={{width: 'auto', display: 'block'}}
  />
);

export default SoloBuildLogo;
