<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Declaración Jurada — No Antecedentes — {{ $postulacion->persona?->numero_documento }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 20mm 20mm 20mm 20mm;
        }
        * {
            box-sizing: border-box;
            font-family: 'Times New Roman', Times, serif;
            color: #0f172a;
        }
        body {
            margin: 0;
            padding: 0;
            background: #f1f5f9;
            font-size: 13.5px;
            line-height: 1.6;
        }
        .page-container {
            width: 210mm;
            min-height: 297mm;
            padding: 25mm 25mm;
            margin: 20px auto;
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
        .header {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 25px;
        }
        .header h3 {
            margin: 0;
            font-size: 13px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .header h1 {
            margin: 5px 0;
            font-size: 16px;
            font-weight: bold;
        }
        .header h2 {
            margin: 0;
            font-size: 14px;
            color: #0369a1;
        }
        .doc-title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            text-decoration: underline;
            margin: 25px 0 20px 0;
            line-height: 1.4;
        }
        .legal-base {
            text-align: justify;
            font-style: italic;
            font-size: 12px;
            color: #334155;
            margin-bottom: 25px;
        }
        .intro-p {
            text-align: justify;
            text-indent: 30px;
            margin-bottom: 20px;
        }
        .strong-val {
            font-weight: bold;
        }
        .statement-box {
            border: 1.5px solid #0f172a;
            padding: 15px 20px;
            background: #fafafa;
            margin: 20px 0;
            text-align: justify;
            font-weight: bold;
            line-height: 1.5;
        }
        .commit-p {
            text-align: justify;
            text-indent: 30px;
            margin-bottom: 25px;
        }
        .date-p {
            text-align: right;
            margin: 30px 0 40px 0;
            font-size: 14px;
        }
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 40px;
        }
        .signature-table td {
            vertical-align: bottom;
            text-align: center;
            padding: 10px;
        }
        .huella-box {
            width: 90px;
            height: 120px;
            border: 1.5px solid #0f172a;
            margin: 0 auto 5px auto;
            text-align: center;
            padding-top: 45px;
            font-size: 9px;
            color: #94a3b8;
        }
        .line-sig {
            width: 250px;
            border-top: 1px solid #0f172a;
            margin: 0 auto 6px auto;
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
            background: #0f172a;
            color: #fff;
            border: none;
            padding: 10px 18px;
            font-size: 13px;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .btn-print:hover {
            background: #1e293b;
        }
    </style>
</head>
<body>

    <div class="action-bar no-print">
        <button class="btn-print" onclick="window.print()">
            🖨️ Imprimir Declaración Jurada (A4)
        </button>
    </div>

    <div class="page-container">
        <!-- HEADER -->
        <div class="header">
            <h3>Ministerio de Educación — República del Perú</h3>
            <h1>INSTITUTO DE EDUCACIÓN SUPERIOR PEDAGÓGICO PÚBLICO "ARCO IRIS"</h1>
            <h2>COMISIÓN INSTITUCIONAL DEL PROCESO DE ADMISIÓN {{ $postulacion->proceso?->codigo }}</h2>
        </div>

        <!-- TÍTULO -->
        <div class="doc-title">
            DECLARACIÓN JURADA DE NO REGISTRAR ANTECEDENTES PENALES, JUDICIALES NI POLICIALES
        </div>

        <div class="legal-base">
            (Formulado en concordancia con el Artículo 51° del Texto Único Ordenado de la Ley N° 27444 — Ley del Procedimiento Administrativo General, aprobado por D.S. N° 004-2019-JUS)
        </div>

        <!-- CUERPO -->
        <p class="intro-p">
            Yo, <span class="strong-val">{{ $postulacion->persona?->apellido_paterno }} {{ $postulacion->persona?->apellido_materno }}, {{ $postulacion->persona?->nombres }}</span>, 
            identificado(a) con {{ $postulacion->persona?->tipo_documento ?? 'DNI' }} N° <span class="strong-val">{{ $postulacion->persona?->numero_documento }}</span>, 
            de estado civil {{ $postulacion->persona?->sexo === 'F' ? 'soltera' : 'soltero' }}, con domicilio real y legal ubicado en 
            <span class="strong-val">{{ $postulacion->persona?->direccion ?? '...........................................................................................................................' }}</span>, 
            teléfono celular <span class="strong-val">{{ $postulacion->persona?->celular ?? '..................' }}</span>, 
            y correo electrónico <span class="strong-val">{{ $postulacion->persona?->email_personal ?? '....................................' }}</span>; 
            postulante al Programa de Estudios de <span class="strong-val">{{ $postulacion->programaOfertado?->programaEstudio?->nombre }}</span> 
            en el Proceso de Admisión {{ $postulacion->proceso?->codigo }}:
        </p>

        <div class="statement-box">
            DECLARO BAJO JURAMENTO:
            <br><br>
            1. NO REGISTRAR ANTECEDENTES PENALES en el Registro Nacional de Condenas del Poder Judicial.<br>
            2. NO REGISTRAR ANTECEDENTES JUDICIALES en los juzgados o salas del Poder Judicial a nivel nacional.<br>
            3. NO REGISTRAR ANTECEDENTES POLICIALES en la Policía Nacional del Perú.<br>
            4. No encontrarme inhabilitado para el ejercicio de la función pública ni para el ejercicio de la carrera docente.<br>
            5. Gozar de óptima salud física y mental para el normal desarrollo de los estudios de formación inicial docente.
        </div>

        <p class="commit-p">
            Manifestación que realizo en honor a la verdad y en pleno uso de mis facultades legales y civiles. En caso de resultar falsa la presente declaración, me someto a las responsabilidades penales previstas en el Artículo 411° del Código Penal (Delito contra la Fe Pública — Falsa Declaración en Procedimiento Administrativo), asumiendo la anulación inmediata de mi inscripción, evaluación o eventual ingreso a la institución educativa.
        </p>

        <!-- FECHA -->
        <p class="date-p">
            Fecha de suscripción: {{ date('d') }} de {{ \Carbon\Carbon::now()->locale('es')->monthName }} de {{ date('Y') }}
        </p>

        <!-- FIRMA Y HUELLA -->
        <table class="signature-table">
            <tr>
                <td style="width: 60%;">
                    <div style="height: 50px;"></div>
                    <div class="line-sig"></div>
                    <div style="font-weight: bold; font-size: 13px;">
                        FIRMA DEL POSTULANTE DECLARANTE
                    </div>
                    <div>
                        {{ $postulacion->persona?->apellido_paterno }} {{ $postulacion->persona?->apellido_materno }}, {{ $postulacion->persona?->nombres }}
                    </div>
                    <div>
                        DNI: {{ $postulacion->persona?->numero_documento }}
                    </div>
                    <div style="font-size: 11px; color: #475569; margin-top: 3px;">
                        Cód. Postulante: {{ $postulacion->codigo_postulante }} | FUT: {{ $postulacion->numero_fut ?? 'S/N' }}
                    </div>
                </td>
                <td style="width: 40%;">
                    <div class="huella-box">
                        Índice Derecho<br>(Huella Dactilar)
                    </div>
                </td>
            </tr>
        </table>

        <!-- FOOTER -->
        <div style="margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 5px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between;">
            <span>IESP Público "Arco Iris" — Admisión {{ $postulacion->proceso?->codigo }}</span>
            <span>Documento generado por el ERP Institucional</span>
        </div>
    </div>

</body>
</html>

