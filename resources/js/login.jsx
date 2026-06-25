import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import {
    Box,
    Grid,
    Paper,
    TextField,
    Typography,
    Button,
    Stack,
    Alert,
    InputAdornment
} from "@mui/material";

import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import BusinessIcon from "@mui/icons-material/Business";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mensaje, setMensaje] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content"),
            },
            body: JSON.stringify({ email, password }),
        })
            .then((res) => res.json())
            .then((data) => {
                setMensaje(data.message);

                if (data.success) {
                    window.location.href = "/";
                }
            });
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundImage:
                    "url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Overlay */}
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(135deg, rgba(10,20,40,.9), rgba(37,99,235,.75))",
                    backdropFilter: "blur(3px)",
                }}
            />

            {/* Esferas decorativas */}
            <Box
                sx={{
                    position: "absolute",
                    width: 400,
                    height: 400,
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle,#60a5fa 0%, transparent 70%)",
                    top: -100,
                    left: -100,
                    opacity: 0.4,
                    filter: "blur(50px)",
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    width: 300,
                    height: 300,
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle,#8b5cf6 0%, transparent 70%)",
                    bottom: -100,
                    right: -100,
                    opacity: 0.4,
                    filter: "blur(60px)",
                }}
            />

            <Grid
                container
                sx={{
                    position: "relative",
                    zIndex: 2,
                    minHeight: "100vh",
                }}
            >
                {/* Panel izquierdo */}
                <Grid
                    size={{ xs: 0, md: 7 }}
                    sx={{
                        display: {
                            xs: "none",
                            md: "flex",
                        },
                        alignItems: "center",
                        justifyContent: "center",
                        p: 8,
                    }}
                >
                    <Box
                        sx={{
                            color: "white",
                            maxWidth: 600,
                            transform: "perspective(1000px) rotateY(-8deg)",
                        }}
                    >
                        <Typography
                            variant="h2"
                            fontWeight={900}
                            gutterBottom
                        >
                            ERP NEXT
                        </Typography>

                        <Typography
                            variant="h5"
                            sx={{
                                opacity: 0.9,
                                mb: 4,
                            }}
                        >
                            Gestiona inventario, ventas, compras,
                            contabilidad y operaciones desde una sola
                            plataforma.
                        </Typography>

                        <Paper
                            sx={{
                                p: 4,
                                background:
                                    "rgba(255,255,255,.08)",
                                backdropFilter: "blur(15px)",
                                border: "1px solid rgba(255,255,255,.1)",
                                color: "#fff",
                                borderRadius: 5,
                                boxShadow:
                                    "0 30px 60px rgba(0,0,0,.35)",
                            }}
                        >
                            <Typography variant="h6">
                                🚀 Dashboard inteligente
                            </Typography>

                            <Typography mt={1}>
                                KPIs en tiempo real, reportes avanzados y
                                automatización empresarial.
                            </Typography>
                        </Paper>
                    </Box>
                </Grid>

                {/* Login */}
                <Grid
                    size={{ xs: 12, md: 5 }}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 3,
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            width: "100%",
                            maxWidth: 450,
                            p: 5,
                            borderRadius: 6,

                            background:
                                "rgba(255,255,255,.15)",

                            backdropFilter: "blur(20px)",

                            border:
                                "1px solid rgba(255,255,255,.2)",

                            boxShadow:
                                "0 25px 60px rgba(0,0,0,.4)",

                            transform:
                                "perspective(1000px) rotateY(5deg)",

                            transition: ".4s",
                            "&:hover": {
                                transform:
                                    "perspective(1000px) rotateY(0deg) translateY(-5px)",
                            },
                        }}
                    >
                        <Stack
                            spacing={3}
                            component="form"
                            onSubmit={handleSubmit}
                        >
                            <Box textAlign="center">
                                <BusinessIcon
                                    sx={{
                                        fontSize: 60,
                                        color: "#fff",
                                        mb: 1,
                                    }}
                                />

                                <Typography
                                    variant="h4"
                                    fontWeight={800}
                                    color="white"
                                >
                                    Bienvenido
                                </Typography>

                                <Typography
                                    color="rgba(255,255,255,.8)"
                                >
                                    Ingrese a su ERP
                                </Typography>
                            </Box>

                            <TextField
                                fullWidth
                                label="Correo electrónico"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                variant="outlined"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    bgcolor:
                                        "rgba(255,255,255,.9)",
                                    borderRadius: 2,
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Contraseña"
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    bgcolor:
                                        "rgba(255,255,255,.9)",
                                    borderRadius: 2,
                                }}
                            />

                            <Button
                                type="submit"
                                size="large"
                                variant="contained"
                                sx={{
                                    py: 1.8,
                                    borderRadius: 3,
                                    fontWeight: 700,
                                    fontSize: "1rem",

                                    background:
                                        "linear-gradient(135deg,#2563eb,#7c3aed)",

                                    boxShadow:
                                        "0 10px 30px rgba(59,130,246,.5)",

                                    "&:hover": {
                                        background:
                                            "linear-gradient(135deg,#1d4ed8,#6d28d9)",
                                    },
                                }}
                            >
                                Ingresar
                            </Button>

                            {mensaje && (
                                <Alert severity="info">
                                    {mensaje}
                                </Alert>
                            )}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

const root = ReactDOM.createRoot(
    document.getElementById("login-root")
);

root.render(<LoginForm />);