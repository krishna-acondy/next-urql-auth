import React from "react";
import Head from "next/head";
import { withUrqlClient } from "next-urql";
import styles from "../styles/Home.module.css";
import { clientOptions } from "../shared/client";
import Login from "./Login";
import { AuthState, getToken, saveAuthState } from "../shared/auth";
import Profile from "./Profile";

function Home() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const onLoginSuccess = (auth: AuthState) => {
    saveAuthState(auth);
    setIsLoggedIn(true);
  };

  React.useEffect(() => {
    if (getToken()) {
      setIsLoggedIn(true);
    }
  }, []);
  return (
    <>
      <Head>
        <title>Next.js + URQL JWT Authentication</title>
        <meta name="description" content="Next.js + URQL JWT Authentication" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        {isLoggedIn ? <Profile /> : <Login onLogin={onLoginSuccess} />}
      </main>
    </>
  );
}

export default withUrqlClient((ssrExchange) => clientOptions(ssrExchange))(
  Home
);
