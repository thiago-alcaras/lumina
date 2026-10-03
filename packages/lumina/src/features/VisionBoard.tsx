import ImageCollection from "../components/ImageCollection";
import type { FeatureProps } from "../components/Shared";
export default function VisionBoard(props: FeatureProps) {
  return <ImageCollection {...props} mode="vision" />;
}
