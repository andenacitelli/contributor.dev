import { createGetInitialProps } from "@mantine/next";
import Document, { Html, Main, NextScript } from "next/document";
import { Head } from "next/document";

import { PROJECT_CONFIG } from "@/config";

const getInitialProps = createGetInitialProps();

export default class _Document extends Document {
  static getInitialProps = getInitialProps;
  render() {
    return (
      <Html>
        <Head>
          <meta name="description" content={PROJECT_CONFIG.longDescription} />
          <link rel="shortcut icon" href="/favicon.png" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
