import { Navigate } from "react-router-dom";

/** @deprecated Use /audio/spi via SpecialtyStaticAudioPage */
export default function SpiAudioPage() {
  return <Navigate to="/audio/spi" replace />;
}
