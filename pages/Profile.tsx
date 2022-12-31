import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { gql, useQuery } from "urql";
import { clearAuthState } from "../shared/auth";

const PROFILE_QUERY = gql`
  query Profile {
    me {
      id
      username
      createdAt
    }
  }
`;

const Profile = () => {
  const [{ data, fetching, error }] = useQuery({ query: PROFILE_QUERY });

  return (
    <Stack
      sx={{
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          border: (theme) => `1px solid ${theme.palette.grey[300]}`,
          borderRadius: 1,
          p: 2,
          minWidth: 400,
        }}
      >
        <Stack justifyContent="center" alignItems="center">
          {fetching && <CircularProgress />}
          {!!error && <Alert severity="error">{error.message}</Alert>}
          {!!data && (
            <Stack>
              <Typography variant="caption">User ID</Typography>
              <Typography variant="h5">{data?.me?.id ?? ""}</Typography>
              <Typography variant="caption">Username</Typography>
              <Typography variant="h5">{data?.me?.username ?? ""}</Typography>
              <Typography variant="caption">Created</Typography>
              <Typography variant="h5">
                {new Date(data?.me?.createdAt ?? "").toDateString()}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Box>
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => {
          clearAuthState();
          window.location.reload();
        }}
      >
        Log out
      </Button>
    </Stack>
  );
};

export default Profile;
