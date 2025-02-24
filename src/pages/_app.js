
export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return<Component/>
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
