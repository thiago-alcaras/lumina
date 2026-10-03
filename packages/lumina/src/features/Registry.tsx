import ImageCollection from "../components/ImageCollection";
import type { FeatureProps } from "../components/Shared";
export default function Registry(props: FeatureProps) {
  return <ImageCollection {...props} mode="registry" />;
}
