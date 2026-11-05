import { Redirect } from 'expo-router';

/** OAuth dönüş adresi: oturum lib/oauth.ts'te kurulur, kullanıcı ana ekrana yönlendirilir. */
export default function AuthCallback() {
  return <Redirect href="/" />;
}
