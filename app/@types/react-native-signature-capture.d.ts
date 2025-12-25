declare module 'react-native-signature-capture' {
  import { Component } from 'react';
    import { ViewStyle } from 'react-native';

  interface SignatureCaptureProps {
    style?: ViewStyle;
    onSaveEvent?: (result: { pathName: string; encoded: string }) => void;
    onDragEvent?: () => void;
    saveImageFileInExtStorage?: boolean;
    showNativeButtons?: boolean;
    showTitleLabel?: boolean;
    backgroundColor?: string;
    strokeColor?: string;
    minStrokeWidth?: number;
    maxStrokeWidth?: number;
  }

  export default class SignatureCapture extends Component<SignatureCaptureProps> {
    saveImage(): void;
    resetImage(): void;
  }
}
