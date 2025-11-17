// app/ui/src/components/GoogleSignInButton.tsx
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

const ERROR_MSG_LOGIN_FAILED = 'Falha no login com Google';

interface GoogleSignInButtonProps {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError?: () => void;
}

export default function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const handleError = () => {
    console.error(ERROR_MSG_LOGIN_FAILED);
    if (onError) {
      onError();
    }
  };

  return (
    <GoogleLogin
      onSuccess={onSuccess}
      onError={handleError}
      useOneTap={false}
      type="standard"
      theme="outline"
      size="large"
      text="signin_with"
      shape="rectangular"
      logo_alignment="left"
    />
  );
}
