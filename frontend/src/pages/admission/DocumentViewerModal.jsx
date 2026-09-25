import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton,
} from '@mui/material';
import { Printer, ExternalLink, X, FileText } from 'lucide-react';
import { THEME_COLORS } from '../../theme/colors';

export default function DocumentViewerModal({ open, onClose, title, printUrl }) {
    if (!open) return null;

    const handlePrint = () => {
        const iframe = document.getElementById('document-print-frame');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        } else {
            window.open(printUrl, '_blank');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #e2e8f0',
                    py: 1.5,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FileText size={20} color={THEME_COLORS.primary} />
                    <Typography variant="h6" fontWeight={700} fontSize={16}>
                        {title}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <X size={18} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, backgroundColor: '#f8fafc', height: '75vh' }}>
                <iframe
                    id="document-print-frame"
                    src={printUrl}
                    title={title}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        backgroundColor: '#ffffff',
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
                <Button
                    variant="outlined"
                    startIcon={<ExternalLink size={16} />}
                    onClick={() => window.open(printUrl, '_blank')}
                    sx={{ textTransform: 'none' }}
                >
                    Abrir en Pestaña Completa
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={onClose} sx={{ textTransform: 'none' }}>
                        Cerrar
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Printer size={16} />}
                        onClick={handlePrint}
                        sx={{
                            backgroundColor: THEME_COLORS.primary,
                            '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Imprimir Documento Oficial (A4)
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}

