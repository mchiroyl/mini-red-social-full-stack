import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#1877f2" />
        <meta name="description" content="Mini Red Social - Conecta con amigos y comparte momentos. Proyecto desarrollado por Marvin Chiroy, Josue Sánchez y Obady Pérez" />
        <meta name="author" content="Marvin Chiroy, Josue Sánchez, Obady Pérez" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
