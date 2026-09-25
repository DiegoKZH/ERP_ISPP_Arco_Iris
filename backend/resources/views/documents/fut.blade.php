<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FUT — Formulario Único de Trámite — {{ $postulacion->numero_fut ?? $postulacion->codigo_postulante }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm 15mm 12mm 15mm;
        }
        * {
            box-sizing: border-box;
            font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
            color: #1e293b;
        }
        body {
            margin: 0;
            padding: 0;
            background: #f1f5f9;
            font-size: 11px;
            line-height: 1.35;
        }
        .page-container {
            width: 210mm;
            min-height: 297mm;
            padding: 12mm 15mm;
            margin: 15px auto;
            background: #ffffff;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            border-radius: 4px;
            position: relative;
        }
        @media print {
            body {
                background: none;
            }
            .page-container {
                width: 100%;
                margin: 0;
                padding: 0;
                box-shadow: none;
                border-radius: 0;
            }
            .no-print {
                display: none !important;
            }
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }
        .header-title {
            text-align: center;
        }
        .header-title h4 {
            margin: 0;
            font-size: 10px;
            letter-spacing: 1px;
            color: #64748b;
            text-transform: uppercase;
        }
        .header-title h2 {
            margin: 2px 0;
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
        }
        .header-title h3 {
            margin: 0;
            font-size: 12px;
            font-weight: 700;
            color: #0284c7;
        }
        .fut-badge {
            border: 2px solid #0f172a;
            border-radius: 6px;
            padding: 6px 10px;
            text-align: center;
            background: #f8fafc;
        }
        .fut-badge .title {
            font-weight: 800;
            font-size: 13px;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }
        .fut-badge .num {
            font-size: 16px;
            font-weight: 900;
            color: #b91c1c;
            letter-spacing: 1px;
        }
        .fut-badge .date {
            font-size: 9px;
            color: #475569;
            margin-top: 2px;
        }
        .section-header {
            background: #0f172a;
            color: #ffffff;
            font-weight: 700;
            font-size: 10.5px;
            padding: 3px 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-radius: 3px;
            margin-top: 8px;
            margin-bottom: 4px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
        }
        .data-table td, .data-table th {
            border: 1px solid #cbd5e1;
            padding: 4px 6px;
            font-size: 10.5px;
            vertical-align: middle;
        }
        .data-table th {
            background: #f8fafc;
            color: #334155;
            font-weight: 600;
            text-align: left;
            width: 25%;
        }
        .val-bold {
            font-weight: 700;
            color: #0f172a;
        }
        .check-item {
            display: inline-flex;
            align-items: center;
            margin-right: 15px;
            font-size: 10px;
        }
        .check-box {
            display: inline-block;
            width: 13px;
            height: 13px;
            border: 1.5px solid #0f172a;
            margin-right: 5px;
            text-align: center;
            line-height: 11px;
            font-weight: 900;
            font-size: 11px;
            vertical-align: middle;
        }
        .write-lines {
            border-bottom: 1px dotted #94a3b8;
            height: 18px;
            margin-bottom: 3px;
        }
        .signatures-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .signatures-table td {
            width: 50%;
            vertical-align: top;
            padding: 6px;
        }
        .signature-box {
            border: 1px dashed #64748b;
            border-radius: 4px;
            height: 85px;
            text-align: center;
            position: relative;
            background: #fafafa;
        }
        .signature-box .label {
            position: absolute;
            bottom: 4px;
            left: 0;
            right: 0;
            font-size: 9.5px;
            font-weight: 600;
            color: #475569;
            border-top: 1px solid #cbd5e1;
            padding-top: 2px;
            margin: 0 10px;
        }
        .stamp-box {
            border: 1px solid #94a3b8;
            border-radius: 4px;
            height: 85px;
            text-align: center;
            padding-top: 5px;
            color: #94a3b8;
            font-size: 9px;
            text-transform: uppercase;
            background: #fff;
        }
        .action-bar {
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
            z-index: 999;
        }
        .btn-print {
            background: #0284c7;
            color: #fff;
            border: none;
            padding: 10px 18px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .btn-print:hover {
            background: #0369a1;
        }
    </style>
</head>
<body>

    <div class="action-bar no-print">
        <button class="btn-print" onclick="window.print()">
            🖨️ Imprimir Formato de FUT (A4)
        </button>
    </div>

    <div class="page-container">
        <!-- HEADER -->
        <table class="header-table">
            <tr>
                <td style="width: 15%; text-align: center;">
                    <div style="font-weight: 900; font-size: 22px; color: #0284c7;">IESP</div>
                    <div style="font-size: 8px; font-weight: 700;">ARCO IRIS</div>
                </td>
                <td class="header-title" style="width: 55%;">
                    <h4>República del Perú — Ministerio de Educación</h4>
                    <h3>DIRECCIÓN REGIONAL DE EDUCACIÓN</h3>
                    <h2>INSTITUTO DE EDUCACIÓN SUPERIOR PEDAGÓGICO PÚBLICO</h2>
                    <div style="font-size: 9.5px; font-weight: 600; color: #475569;">
                        COMISIÓN CENTRAL DEL PROCESO DE ADMISIÓN {{ $postulacion->proceso?->codigo }}
                    </div>
                </td>
                <td style="width: 30%;">
                    <div class="fut-badge">
                        <div class="title">F.U.T. OFICIAL</div>
                        <div class="num">{{ $postulacion->numero_fut ?? 'FUT-PENDIENTE' }}</div>
                        <div class="date">Fecha Emisión: {{ $postulacion->fecha_emision_fut?->format('d/m/Y H:i') ?? date('d/m/Y') }}</div>
                        <div class="date">Cód. Postulante: <strong>{{ $postulacion->codigo_postulante }}</strong></div>
                    </div>
                </td>
            </tr>
        </table>

        <!-- RESUMEN PETICIÓN -->
        <div style="background: #f1f5f9; border-left: 4px solid #0284c7; padding: 5px 8px; margin-bottom: 6px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="width: 18%; font-weight: 700; font-size: 10px;">SUMILLA:</td>
                    <td style="font-weight: 800; font-size: 11px; color: #0f172a;">
                        SOLICITA INSCRIPCIÓN AL PROCESO DE ADMISIÓN {{ $postulacion->proceso?->codigo }} — PROGRAMA: {{ $postulacion->programaOfertado?->programaEstudio?->nombre }}
                    </td>
                </tr>
                <tr>
                    <td style="font-weight: 700; font-size: 10px;">SEÑOR(A):</td>
                    <td style="font-size: 10px; color: #334155;">
                        DIRECTOR GENERAL / PRESIDENTE DE LA COMISIÓN DE ADMISIÓN DEL IESP PÚBLICO
                    </td>
                </tr>
            </table>
        </div>

        <!-- SECCIÓN 1: DATOS DEL ADMINISTRADO -->
        <div class="section-header">I. DATOS DEL ADMINISTRADO (POSTULANTE)</div>
        <table class="data-table">
            <tr>
                <th>Documento de Identidad:</th>
                <td class="val-bold">{{ $postulacion->persona?->tipo_documento ?? 'DNI' }}: {{ $postulacion->persona?->numero_documento }}</td>
                <th>Código de Tesorería (DNI):</th>
                <td class="val-bold" style="color: #0284c7;">{{ $postulacion->codigo_tesoreria ?? $postulacion->persona?->numero_documento }}</td>
            </tr>
            <tr>
                <th>Apellidos y Nombres:</th>
                <td colspan="3" class="val-bold" style="font-size: 11.5px;">
                    {{ $postulacion->persona?->apellido_paterno }} {{ $postulacion->persona?->apellido_materno }}, {{ $postulacion->persona?->nombres }}
                </td>
            </tr>
            <tr>
                <th>Domicilio / Dirección:</th>
                <td colspan="3">{{ $postulacion->persona?->direccion ?? '........................................................................................................................' }}</td>
            </tr>
            <tr>
                <th>Teléfono Celular:</th>
                <td>{{ $postulacion->persona?->celular ?? '..................' }}</td>
                <th>Correo Electrónico:</th>
                <td>{{ $postulacion->persona?->email_personal ?? '....................................' }}</td>
            </tr>
        </table>

        <!-- SECCIÓN 2: DATOS DEL TRÁMITE DE ADMISIÓN -->
        <div class="section-header">II. PROGRAMA DE ESTUDIOS Y VALIDACIÓN DE TESORERÍA</div>
        <table class="data-table">
            <tr>
                <th>Programa Ofertado:</th>
                <td class="val-bold" style="color: #0f172a;">{{ $postulacion->programaOfertado?->programaEstudio?->nombre }}</td>
                <th>Modalidad:</th>
                <td>{{ $postulacion->programaOfertado?->modalidad?->nombre ?? 'ORDINARIO' }}</td>
            </tr>
            <tr>
                <th>Estado de Pago de Tesorería:</th>
                <td class="val-bold" style="color: {{ $postulacion->estado_pago === 'PAGADO' ? '#166534' : '#b91c1c' }};">
                    {{ $postulacion->estado_pago === 'PAGADO' ? '✅ VALIDADO / PAGADO' : '⏳ PENDIENTE' }}
                </td>
                <th>N° Recibo / Operación:</th>
                <td class="val-bold">{{ $postulacion->comprobante_pago ?? '...........................' }}</td>
            </tr>
            <tr>
                <th>Fecha de Pago:</th>
                <td>{{ $postulacion->fecha_pago?->format('d/m/Y H:i') ?? '...........................' }}</td>
                <th>Monto Abonado:</th>
                <td class="val-bold">S/ {{ number_format($postulacion->monto_pago ?? 150.00, 2) }}</td>
            </tr>
        </table>

        <!-- SECCIÓN 3: PROCEDENCIA ESCOLAR SECUNDARIA -->
        <div class="section-header">III. PROCEDENCIA EDUCATIVA SECUNDARIA</div>
        <table class="data-table">
            <tr>
                <th>Institución Educativa (Colegio):</th>
                <td colspan="3" class="val-bold">{{ $postulacion->colegio_fin_secundaria ?? '........................................................................................................................' }}</td>
            </tr>
            <tr>
                <th>Código Modular del Colegio:</th>
                <td class="val-bold" style="letter-spacing: 1px;">{{ $postulacion->codigo_modular_colegio ?? '...............' }}</td>
                <th>Año de Egreso de Secundaria:</th>
                <td class="val-bold">{{ $postulacion->anio_egreso_colegio ?? '...............' }}</td>
            </tr>
            <tr>
                <th>Tipo de Gestión:</th>
                <td>{{ $postulacion->colegio_tipo_gestion ?? 'PÚBLICA' }}</td>
                <th>Ubicación Geográfica:</th>
                <td>{{ $postulacion->colegio_distrito ? $postulacion->colegio_distrito . ' - ' . $postulacion->colegio_provincia : '......................................................' }}</td>
            </tr>
        </table>

        <!-- SECCIÓN 4: REQUISITOS ADJUNTOS VERIFICADOS -->
        <div class="section-header">IV. DOCUMENTOS Y REQUISITOS ADJUNTOS AL EXPEDIENTE</div>
        <div style="border: 1px solid #cbd5e1; padding: 6px 10px; background: #fff; margin-bottom: 6px;">
            <div class="check-item">
                <span class="check-box">{{ $postulacion->tiene_copia_dni_color ? 'X' : '' }}</span>
                Fotocopia de DNI a Color
            </div>
            <div class="check-item">
                <span class="check-box">{{ $postulacion->tiene_partida_nacimiento ? 'X' : '' }}</span>
                Partida de Nacimiento
            </div>
            <div class="check-item">
                <span class="check-box">{{ $postulacion->tiene_certificado_nacimiento_original ? 'X' : '' }}</span>
                Certificado de Nacimiento Original
            </div>
            <div class="check-item">
                <span class="check-box">{{ !empty($postulacion->foto_url) ? 'X' : '' }}</span>
                Fotografía tamaño carnet / pasaporte
            </div>
            <div class="check-item">
                <span class="check-box">{{ $postulacion->estado_pago === 'PAGADO' ? 'X' : '' }}</span>
                Recibo de Pago de Tesorería
            </div>
        </div>

        <!-- SECCIÓN 5: ESPACIOS EN BLANCO PARA COMPLETAR CON LAPICERO -->
        <div class="section-header">V. OBSERVACIONES Y FUNDAMENTACIÓN ADICIONAL (LLENAR CON LAPICERO)</div>
        <div style="border: 1px solid #cbd5e1; padding: 6px; background: #ffffff;">
            <div style="font-size: 9.5px; color: #64748b; margin-bottom: 4px;">
                Espacio reservado para aclaraciones del postulante o anotaciones complementarias de Mesa de Partes:
            </div>
            <div class="write-lines"></div>
            <div class="write-lines"></div>
            <div class="write-lines"></div>
            <div style="margin-top: 5px; display: flex; justify-content: space-between; font-weight: 700; font-size: 10px;">
                <span>Total de folios útiles adjuntos presentados: [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ] folios.</span>
                <span>Fecha de recepción: [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / 2026 ]</span>
            </div>
        </div>

        <!-- FIRMAS Y RECEPCIÓN -->
        <table class="signatures-table">
            <tr>
                <td>
                    <div class="signature-box">
                        <div style="padding-top: 30px; font-size: 8.5px; color: #94a3b8;">
                            (Espacio para firma y huella manuscrita con lapicero azul o negro)
                        </div>
                        <div class="label">
                            FIRMA DEL ADMINISTRADO (POSTULANTE)<br>
                            DNI: {{ $postulacion->persona?->numero_documento }}
                        </div>
                    </div>
                </td>
                <td>
                    <div class="stamp-box">
                        <div style="margin-top: 15px; font-weight: 700; color: #64748b;">
                            RECEPCIÓN MESA DE PARTES
                        </div>
                        <div style="font-size: 8.5px; margin-top: 5px;">
                            Sello, Firma y N° de Registro Institucional
                        </div>
                    </div>
                </td>
            </tr>
        </table>

        <!-- PIE DE PÁGINA -->
        <div style="margin-top: 15px; border-top: 1px solid #cbd5e1; padding-top: 4px; font-size: 8.5px; color: #64748b; display: flex; justify-content: space-between;">
            <span>Sistema Integrado ERP Instituto — IESP Arco Iris</span>
            <span>Documento Oficial Generado — Trámite N° {{ $postulacion->numero_fut ?? $postulacion->codigo_postulante }}</span>
        </div>
    </div>

</body>
</html>

