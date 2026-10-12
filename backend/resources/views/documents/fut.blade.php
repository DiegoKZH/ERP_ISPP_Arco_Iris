<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FUT — Formulario Único de Trámite — {{ $postulacion->numero_fut ?? $postulacion->codigo_postulante }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm 15mm;
        }

        * {
            box-sizing: border-box;
            font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
        }

        body {
            margin: 0;
            padding: 0;
            background: #f1f5f9;
            color: #1e293b;
            font-size: 11px;
            line-height: 1.35;
        }

        .page-container {
            width: 210mm;
            min-height: 297mm;
            padding: 12mm 15mm;
            margin: 15px auto;
            background: #fff;
            position: relative;
        }

        .action-bar {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 999;
        }

        .btn-print {
            background: #0284c7;
            color: #fff;
            border: 0;
            padding: 10px 18px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
        }

        .btn-print:hover {
            background: #0369a1;
        }

       

            @media print {
                body {
                    margin: 0;
                    padding: 0;
                }

                .container {
                    width: 21cm;
                    height: 29.7cm;
                    border: none;
                }

                .no-print {
                display: none !important;
            }


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

    <div id="fut">

        <span style="font-size:20px;">
            <center>
            <img src="../images/Membrete - Encabezado.png" alt="" width="100%" height="100" />    
            <span style="text-align: center;font-size: 30px;"><b>Formulario Unico de Tr&aacute;mite (FUT)</b></span>
            </center>
        </span>
    
    
        <div style="display: flex; flex-direction: row">
            <div style="width: 100%;">
                <table style="border-collapse: collapse; width: 95%; height: 10px; margin-top: 5px" border="1">
                    <tbody>
                        <tr >
                            <td style="width: 99.8258%;;border: solid 2px"><span style="background-color: #dae1f3">&nbsp; <b>Solicita:</b> </span>&nbsp; Examen de Admisión 2026 - II </td>
                        </tr>
                
                        <tr>
                            <td style="width: 99.8258%;border: solid 2px;background-color: white">&nbsp;</td>
                        </tr>
                
                        <tr >
                            <td style="width: 99.8258%; text-align: center; border: solid 2px; background-color: #dae1f3">
                                <b>SUMILLA</b>
                            </td>

                        </tr>
                    </tbody>
                </table>

                <br>

                <table style="border-collapse: collapse; width: 95%; height: 31px;" border="1">
                    <tbody>
                    <tr style="height: 18px;">
                    <td style="width: 100%; height: 18px;border: solid 2px">&nbsp; <b>Se&ntilde;or(a) Lugar y Fecha "Arco Iris" Cusco</b></td>
                    </tr>
                    <tr style="height: 18px;">
                    <td style="width: 100%; height: 18px; text-align: center;background-color: RGB(217, 226, 241);border: solid 2px;"><b>DEPENDENCIA O AUTORIDAD A QUIEN SE DIRIGE</b></td>
                    </tr>
                    </tbody>
                </table>
                

            </div>

            <div>
                <div style="width: 300px; height: 150px; position: relative;">

                    <span id="fecha" style="position: absolute; top: 97px; left: 80px; font-size: 13px"></span>
                    <span id="hora" style="position: absolute; top: 97px; left: 230px; font-size: 13px"></span>

                    <img src="sellofut.jpg" style="width:300px; height: 165px;" alt="">

                    <span style="font-size:12px;position: absolute; top: 160px; left: 20px;">Sello de recepción del expediente</span>

                </div>
            </div>
            

        </div>
       
        <br>
        
        <table style="border-collapse: collapse; width: 100%;margin-bottom:5px;" border="1">
            <tbody>
            <tr>
            <td style="width: 33.3333%;border: solid 2px">&nbsp;</td>
            <td style="width: 33.3333%;border: solid 2px">&nbsp; </td>
            <td style="width: 33.3333%;border: solid 2px">&nbsp; </td>
            </tr>
            <tr>
            <td style="width: 33.3333%; text-align: center;background-color: #dae1f3;border: solid 2px"><b>APELLIDO PATERNO</b></td>
            <td style="width: 33.3333%; text-align: center;background-color: #dae1f3;border: solid 2px"><b>APELLIDO MATERNO</b></td>
            <td style="width: 33.3333%; text-align: center;background-color: #dae1f3;border: solid 2px"><b>NOMBRES</b></td>
            </tr>
            </tbody>
        </table>
    
    
        <table style="border-collapse: collapse; width: 100%;margin-bottom:5px;" border="1">
            <tbody>
            <tr>
                <td style="width: 100%;border: solid 2px">&nbsp;</td>
            </tr>
            <tr>
            <td style="width: 100%; text-align: center;background-color: #dae1f3;border: solid 2px"><b>DIRECCI&Oacute;N DOMICILIARIA (Av. Jr. Psje.)</b></td>
            </tr>
            </tbody>
        </table>
    
    
        <table style="border-collapse: collapse; width: 100%;margin-bottom:5px;" border="1">
            <tbody>
            <tr>
            <td style="width: 33.3333%;border: solid 2px">&nbsp;</td>
            <td style="width: 33.3333%;border: solid 2px">&nbsp;</td>
            <td style="width: 33.3333%;border: solid 2px">&nbsp;</td>
            </tr>
            <tr>
            <td style="width: 33.3333%; text-align: center;background-color: #dae1f3;border: solid 2px"><b>DNI</b></td>
            <td style="width: 33.3333%; text-align: center;background-color: #dae1f3;border: solid 2px"><b>TEL&Eacute;FONO/CELULAR</b></td>
            <td style="width: 33.3333%; text-align: center;background-color: #dae1f3;border: solid 2px"><b>CORREO ELECTR&Oacute;NICO</b></td>
            </tr>
            </tbody>
        </table>
    
    
        <table style="border-collapse: collapse; width: 65%; height: 44px;" border="1">  
    <tbody>
        <tr style="height: 18px;background-color: #dae1f3;border: solid 2px">
            <td style="border:none;">&nbsp; <b>ESPECIALIDAD</b></td>
        </tr>
        
        <tr style="height: 18px;">

            <td style="width: 33.3333%; height: 18px;background-color: #dae1f3;border: solid 2px">&nbsp; <b>EDUCACI&Oacute;N FISICA</b></td>
            <td style="width: 4.93462%; height: 18px;border: solid 3px"></td>

            <td style="width: 33.3333%;background-color: #dae1f3;border: solid 2px">&nbsp; <b>EDUCACI&Oacute;N INICIAL</b></td>
            <td style="width: 4.93462%; height: 18px;border: solid 3px"></td>
        
        </tr>
    </tbody>
</table>
    
        <br>
        <span style="text-align: left"><b>Marque con un aspa(x) su solicitud:</b></span>
    
        <table style="border-collapse: collapse; width: 100%;margin-bottom:5px" border="0">
        <tbody>
        <tr>
        <td style="width: 100%;background-color: #dae1f3">&nbsp; <b>1. Certificado de Estudios y/o Creditos</b></td>
        </tr>
        </tbody>
        </table>


        <div style="display: flex; justify-content: center;margin-bottom: 5px">

            <div style="display: inline-block; margin-right: 20px; width: 50%; text-align: center;">

                <table style="border-collapse: collapse; width: 100%; height: 60px;;" border="0">
                    <tbody>
                        
                    <tr style="height: 18px;">
                        <td style="width: 20%; height: 18px;background-color: #dae1f3;  border-top: 2px solid white; border-bottom: 2px solid white;"><b>A&ntilde;o</b></td>
                       
                        <td style="width: 20%; height: 18px;border: solid 2px;">&nbsp;</td>
                        
                        <td style="width: 40%; height: 18px; text-align: center;background-color: #dae1f3;  border-top: 2px solid white; border-bottom: 2px solid white;"><b>Semestres I-II</b></td>
                                                
                        <td style="width: 20%; height: 18px;border: solid 2px;">&nbsp;</td>
                    </tr>

                    <tr style="height: 18px;">
                        <td style="width: 20%; height: 18px;background-color: #dae1f3;  border-top: 2px solid white; border-bottom: 2px solid white;"><b>A&ntilde;o</b></td>
                        
                        <td style="width: 20%; height: 18px;border: solid 2px;">&nbsp;</td>
                        
                        <td style="width: 30%; height: 18px; text-align: center;background-color: #dae1f3;  border-top: 2px solid white; border-bottom: 2px solid white;"><b>Semestres III-IV</b></td>              
                        
                        <td style="width: 20%; height: 18px;border: solid 2px;">&nbsp;</td>
                    </tr>

                    <tr style="height: 18px;">
                        <td style="width: 20%; height: 18px;background-color: #dae1f3;  border-top: 2px solid white; border-bottom: 2px solid white;"><b>A&ntilde;o</b></td>
                        
                        <td style="width: 20%; height: 18px;border: solid 2px;">&nbsp;</td>
                        
                        <td style="width: 30%; height: 18px; text-align: center;background-color: #dae1f3;  border-top: 2px solid white; border-bottom: 2px solid white;"><b>Semestres V-VI</b></td>
                        
                        <td style="width: 20%; height: 18px;border: solid 2px;">&nbsp;</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        
            <div style="display: inline-block; width: 50%; text-align: center;">
                <table style="border-collapse: collapse; width: 100%; height: 60px;" border="0">
                    <tbody>
                        
                    <tr style="height: 18px;">
                        <td style="width: 20%; height: 18px;background-color: #dae1f3; border-top: 2px solid white; border-bottom: 2px solid white;"><b>A&ntilde;o</b></td>
                       
                        <td style="width: 20%; height: 18px;border: solid 2px;">&nbsp;</td>
                        
                        <td style="width: 40%; height: 18px; text-align: center;background-color: #dae1f3;  border-top: 2px solid white; border-bottom: 2px solid white;"><b>Semestres VII-VIII</b></td>
                                                
                        <td style="width: 20%; height: 18px;border: solid 2px;">&nbsp;</td>
                    </tr>

                    <tr style="height: 18px;">
                        <td style="width: 20%; height: 18px;background-color: #dae1f3"><b>A&ntilde;o</b></td>
                        
                        <td style="width: 20%; height: 18px;border: solid 2px;">&nbsp;</td>
                        
                        <td style="width: 30%; height: 18px; text-align: center;background-color: #dae1f3"><b>Semestres IX-X</b></td>              
                        
                        <td style="width: 20%; height: 18px;border: solid 2px;">&nbsp;</td>
                    </tr>

                    <tr style="height: 18px;">
                        <td style="width: 20%; height: 18px;background-color: white;border: none"></td>
                        
                        <td style="width: 20%; height: 18px;border: none">&nbsp;</td>
                        
                        <td style="width: 30%; height: 18px; text-align: center;background-color: white;border: none"></td>              
                        
                        <td style="width: 20%; height: 18px;border: none">&nbsp;</td>
                    </tr>

                   
                    </tbody>
                </table>
            </div>
        
        </div>

    
        <table style="border-collapse: collapse; width: 100%;" border="0">
            <tbody>
            <tr>
            <td style="width: 29.7702%; background-color: #dae1f3; font-size:12px; border-top: 2px solid white; border-bottom: 2px solid white;">&nbsp; <b> 2. Boleta de Notas</b></td>
            <td style="width: 3.5%;border: solid 2px">&nbsp;</td>
            
            <td style="width: 29.7702%; background-color: #dae1f3; font-size:12px; border-top: 2px solid white; border-bottom: 2px solid white;">&nbsp; <b> 8. Traslado interno</b></td>
            <td style="width: 3.5%;border: solid 2px">&nbsp;</td>
            <td style="width: 29.7702%; background-color: #dae1f3; font-size:12px; border-top: 2px solid white; border-bottom: 2px solid white;">&nbsp; <b> 14.Diploma de egresado</b></td>
            <td style="width: 3.5%;border: solid 2px">&nbsp;</td>
            </tr>
            <tr>
            <td style="width: 29.7702%; background-color: #dae1f3; font-size:12px; border-top: 2px solid white; border-bottom: 2px solid white;">&nbsp; <b> 3. Constancia de Estudios</b></td>
            <td style="width: 3.5%;border: solid 2px">&nbsp;</td>
            <td style="width: 29.7702%; background-color: #dae1f3; font-size:12px; border-top: 2px solid white; border-bottom: 2px solid white;">&nbsp; <b> 9. Traslado externo</b></td>
            <td style="width: 3.5%;border: solid 2px">&nbsp;</td>
            <td style="width: 29.7702%; background-color: #dae1f3; font-size:12px; border-top: 2px solid white; border-bottom: 2px solid white;">&nbsp; <b> 15.Certificado de egresado</b></td>
            <td style="width: 3.5%;border: solid 2px">&nbsp;</td>
            </tr>
            <tr>
            <td style="width: 29.7702%; background-color: #dae1f3; font-size:12px; border-top: 2px solid white; border-bottom: 2px solid white;">&nbsp; <b> 4. Constancia de No Adeudor</b></td>
            <td style="width: 3.5%;border: solid 2px">&nbsp;</td>
            <td style="width: 29.7702%; background-color: #dae1f3; font-size:12px; border-top: 2px solid white; border-bottom: 2px solid white;">&nbsp; <b> 10. Licencia Interna</b></td>
            <td style="width: 3.5%;border: solid 2px">&nbsp;</td>
            <td style="width: 29.7702%; background-color: #dae1f3; font-size:12px; border-top: 2px solid white; border-bottom: 2px solid white;">&nbsp; <b> 16. Cert.Talleres de Capacidades</b></td>
            <td style="width: 3.5%;border: solid 2px">&nbsp;</td>
            </tr>
            <tr>
            <td style="width: 29.7702%; background-color: #dae1f3; font-size:12px; border-top: 2px solid white; border-bottom: 2px solid white;">&nbsp; <b> 5. Matricula Extemporanea</b></td>
            <td style="width: 3.5%;border: solid 2px">&nbsp;</td>
            <td style="width: 29.7702%; background-color: #dae1f3; font-size:12px; border-top: 2px solid white; border-bottom: 2px solid white;">&nbsp; <b> 11. Permisos</b></td>
            <td style="width: 3.5%;border: solid 2px">&nbsp;</td>
            <td style="width: 29.7702%; background-color: #dae1f3; font-size:12px; border-top: 2px solid white; border-bottom: 2px solid white;">&nbsp; <b> 17.Constancia Vacante</b></td>
            <td style="width: 3.5%;border: solid 2px">&nbsp;</td>
            </tr>
            <tr>
            <td style="width: 29.7702%; background-color: #dae1f3; font-size:12px; border-top: 2px solid white; border-bottom: 2px solid white;">&nbsp; <b> 6. Convalidaci&oacute;n de Asignatura</b></td>
            <td style="width: 3.5%;border: solid 2px">&nbsp;</td>
            <td style="width: 29.7702%; background-color: #dae1f3; font-size:12px; border-top: 2px solid white; border-bottom: 2px solid white;">&nbsp; <b> 12. Derecho de Titulaci&oacute;n y Sustentaci&oacute;n</b></td>
            <td style="width: 3.5%;border: solid 2px">&nbsp;</td>
            <td style="width: 29.7702%; background-color: #dae1f3; font-size:12px; border-top: 2px solid white; border-bottom: 2px solid white;">&nbsp; <b> 18.Anteproyecto</b></td>
            <td style="width: 3.5%;border: solid 2px">&nbsp;</td>
            </tr>
            <tr>
            <td style="width: 29.7702%; background-color: #dae1f3; font-size:12px; border-top: 2px solid white; border-bottom: 2px solid white;">&nbsp; <b> 7. Ficha de Seguimiento</b></td>
            <td style="width: 3.5%;border: solid 2px">&nbsp;</td>
            <td style="width: 29.7702%; background-color: #dae1f3; font-size:12px; border-top: 2px solid white; border-bottom: 2px solid white;">&nbsp; <b> 13. Cambio de apellidos y nombres</b></td>
            <td style="width: 3.5%;border: solid 2px">&nbsp;</td>
            <td style="width: 29.7702%; background-color: #dae1f3; font-size:12px; border-top: 2px solid white; border-bottom: 2px solid white;">&nbsp; <b> 19.Proyecto de Investigaci&oacute;n</b></td>
            <td style="width: 3.5%;border: solid 2px">&nbsp;</td>
            </tr>
            </tbody>
        </table>
    
        <br>
    
        <table style="border-collapse: collapse; width: 100%; height: 54px;margin-bottom:5px" border="0">
            <tbody>
            <tr style="height: 18px;">
            <td style="width: 50%; height: 18px;border: solid 2px"><span style="background-color: #dae1f3">&nbsp; <b> 20. Otros (Especifique)</b></span></td>
            </tr>
            <tr style="height: 18px;">
            <td style="width: 50%; height: 18px;border: solid 2px">&nbsp;</td>
            </tr>
            <tr style="height: 18px;">
            <td style="width: 50%; height: 18px;border: solid 2px">&nbsp;</td>
            </tr>
            </tbody>
        </table>
    
            
        <table style="border-collapse: collapse; width: 100%;" border="1">
            <tbody>
            <tr>
            <td style="width: 50%;border: solid 2px"><span style="background-color: #dae1f3">&nbsp; <b> 21. Documentos que se adjuntan:</b></span></td>
            </tr>
            <tr>
            <td style="width: 50%;border: solid 2px">&nbsp;</td>
            </tr>
            <tr>
            <td style="width: 50%;border: solid 2px">&nbsp;</td>
            </tr>
            </tbody>
        </table>

        <br><br><br>

        <span id="fechaHora1" style="position: relative; top: 18px; left: 200px"></span>

        <center>

            <p style="text-align: center; margin: 0;" >
                &nbsp; &nbsp; &nbsp; ________________________ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;________________________
            </p>
            <p style="text-align: center; margin: 5px;">&nbsp; &nbsp;&nbsp;&nbsp; <b>Lugar y Fecha</b>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;<b>Firma del Usuario</b></p>
            </center>
    
        <span>------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------</span>
    
        <div style="display: flex; flex-direction: row">

            <div style="width: 100%;" >

                <table style="border-collapse: collapse; width: 95%;margin-bottom:5px" border="1">
                    <tbody>
                    <tr>
                    <td style="width: 100%;background-color: #dae1f3;border: solid 2px">&nbsp; <b>Fundamentaci&oacute;n del Pedido</b></td>
                    </tr>
                    <tr>
                    <td style="width: 100%;border: solid 2px">&nbsp; <b>Solicita:</b> &nbsp; Examen de Admisión 2026 - II</td>
                    </tr>
                    <tr>
                    <td style="width: 100%;border: solid 2px">&nbsp;</td>
                    </tr>
                    </tbody>
                </table>
            
                <table style="border-collapse: collapse; width: 95%; height: 36px;margin-bottom:5px" border="1">
                    <tbody>
                    <tr style="height: 18px;">
                    <td style="width: 100%; height: 18px;background-color: #dae1f3;border: solid 2px">&nbsp; <b>Apellidos y Nombres del Solicitante</b></td>
                    </tr>
                    <tr style="height: 18px;">
                    <td style="width: 50%; height: 18px;border: solid 2px"></td>
                    </tr>
                    </tbody>
                </table>
            
                <table style="border-collapse: collapse; width: 95%;" border="1">
                    <tbody>
                    <tr>
                    <td style="width: 30%;background-color: #dae1f3; text-align:center;border: solid 2px">&nbsp; <b>Lugar y Fecha</b></td>
                    <td style="width: 70%;border: solid 2px">&nbsp;<span id="fechaHora" ></span></td>
                    </tr>
                    </tbody>
                </table>

            </div>

            <div>
                <div style="width: 300px; height: 150px; position: relative;">

                    <span id="fecha" style="position: absolute; top: 97px; left: 80px; font-size: 13px"></span>
                    <span id="hora" style="position: absolute; top: 97px; left: 230px; font-size: 13px"></span>

                    <img src="sellofut.jpg" style="width:300px; height: 165px;" alt="">

                    <span style="font-size:12px;position: absolute; top: 160px; left: 20px;">Sello de recepción del expediente</span>

                </div>
            </div>

        </div>
        

       
    </div>

</body>
</html>

