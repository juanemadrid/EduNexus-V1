export interface Permission {
  id: string;
  name: string;
  advanced?: string[];
}

export interface PermissionCategory {
  name: string;
  permissions: Permission[];
}

export interface PermissionSection {
  name: string;
  categories: PermissionCategory[];
}

export const MASTER_PERMISSIONS: PermissionSection[] = [
  {
    name: 'Institucional',
    categories: [
      {
        name: 'Acudientes',
        permissions: [
          { id: 'inst_acud_reg', name: 'Registrar acudientes' },
          { id: 'inst_acud_info', name: 'Información básica' }
        ]
      },
      {
        name: 'Administrativos',
        permissions: [
          { id: 'inst_admin_gest', name: 'Gestión de administrativos' },
          { id: 'inst_admin_firma', name: 'No permitir carga firma' },
          { id: 'inst_admin_horar', name: 'Permitir administrar horario' }
        ]
      },
      {
        name: 'Admisiones',
        permissions: [
          { id: 'inst_admi_examen', name: 'Categorías examen de admisión' },
          { id: 'inst_admi_resu', name: 'Resultados examen de admisión' },
          { id: 'inst_admi_entr', name: 'Entrevistas admisión' },
          { id: 'inst_admi_requ', name: 'Requisitos de admisión' },
          { id: 'inst_admi_conf', name: 'Configuración admisión' }
        ]
      },
      {
        name: 'Bienestar Institucional',
        permissions: [
          { id: 'inst_bien_encues', name: 'Administrar encuestas' },
          { id: 'inst_bien_prac', name: 'Encuestas prácticas laborales' },
          { id: 'inst_bien_ofer', name: 'Ofertas laborales' },
          { id: 'inst_bien_soli', name: 'Solicitudes' }
        ]
      },
      {
        name: 'Comercial CRM',
        permissions: [
          { id: 'inst_crm_opor', name: 'Oportunidades' },
          { id: 'inst_crm_publi', name: 'Medios publicitarios' },
          { id: 'inst_crm_cont', name: 'Medios de contacto' },
          { id: 'inst_crm_nego', name: 'Estados de negocio' },
          { id: 'inst_crm_campos', name: 'Campos personalizados' },
          { id: 'inst_crm_caus', name: 'Causas' },
          { id: 'inst_crm_impo', name: 'Importer oportunidades' },
          { id: 'inst_crm_ases', name: 'Cambio masivo de asesor' }
        ]
      },
      {
        name: 'Docentes',
        permissions: [
          { id: 'inst_doce_reg', name: 'Registrar docentes' },
          { id: 'inst_doce_info', name: 'Información básica' }
        ]
      },
      {
        name: 'Establecimiento',
        permissions: [
          { id: 'inst_esta_config', name: 'Configuración institucional' },
          { id: 'inst_esta_audi', name: 'Auditorías' },
          { id: 'inst_esta_impo', name: 'Importación de personas' },
          { id: 'inst_esta_cargos', name: 'Gestión de cargos' },
          { id: 'inst_esta_depen', name: 'Dependencias' },
          { id: 'inst_esta_dias', name: 'Días no laborales' },
          { id: 'inst_esta_camp', name: 'Campos adicionales y seguridad' }
        ]
      },
      {
        name: 'Estructuración',
        permissions: [
          { id: 'inst_estru_preg', name: 'Preguntas personalizadas' },
          { id: 'inst_estru_para', name: 'Parametrización de informes' },
          { id: 'inst_estru_docs', name: 'Categorías documentos digitales' },
          { id: 'inst_estru_sedes', name: 'Sedes - Jornadas' },
          { id: 'inst_estru_nivel', name: 'Niveles' },
          { id: 'inst_estru_obse', name: 'Criterios del observador' },
          { id: 'inst_estru_aulas', name: 'Aulas' },
          { id: 'inst_estru_peri', name: 'Periodos' },
          { id: 'inst_estru_enti', name: 'Entidades administradoras' },
          { id: 'inst_estru_empr', name: 'Empresas' },
          { id: 'inst_estru_soli', name: 'Tipos de solicitudes' },
          { id: 'inst_estru_perf', name: 'Perfiles' },
          { id: 'inst_estru_inst', name: 'Instituciones educativas' },
          { id: 'inst_estru_ubica', name: 'Parámetros geográficos' },
          { id: 'inst_estru_restr', name: 'Causas y restricciones' }
        ]
      },
      {
        name: 'Estudiantes',
        permissions: [
          { id: 'inst_estu_obse', name: 'Observador' },
          { id: 'inst_estu_obse_est', name: 'Observador de estudiante', advanced: ['No permitir editar observaciones', 'No permitir eliminar observaciones', 'Permitir modificar fecha'] },
          { id: 'inst_estu_admi', name: 'Proceso de admisión' },
          { id: 'inst_estu_egre', name: 'Establecer egresados graduados' },
          { id: 'inst_estu_paz', name: 'Paz y salvo' },
          { id: 'inst_estu_cons', name: 'Consulta - Información académica' },
          { id: 'inst_estu_insc', name: 'Inscritos no matriculados' },
          { id: 'inst_estu_notf', name: 'Notas financieras' },
          { id: 'inst_estu_prem', name: 'Prematriculas' },
          { id: 'inst_estu_reno', name: 'Renovación masiva programas' },
          { id: 'inst_estu_consr', name: 'Consultas restringidas' },
          { id: 'inst_estu_espac', name: 'Permitir agregar espacio adicional en documentos digitales' },
          { id: 'inst_estu_reg', name: 'Registrar estudiantes' },
          { id: 'inst_estu_info', name: 'Información personal' },
          { id: 'inst_estu_acad', name: 'Información académica', advanced: ['Cancelar programa', 'No permitir agregar carga académica', 'Habilitaciones', 'Homologaciones', 'Récord académico'] },
          { id: 'inst_estu_prei', name: 'Preinscripciones' },
          { id: 'inst_estu_pago', name: 'Pagos' },
          { id: 'inst_estu_cred', name: 'Créditos' },
          { id: 'inst_estu_asig', name: 'Permitir asignar documentos de admisión' }
        ]
      },
      {
        name: 'Persona',
        permissions: [
          { id: 'inst_pers_elim', name: 'No permitir eliminar persona' },
          { id: 'inst_pers_foto_n', name: 'No permitir cargar foto' },
          { id: 'inst_pers_cuen', name: 'Administrar cuentas' },
          { id: 'inst_pers_role', name: 'Administrar roles' },
          { id: 'inst_pers_foto_s', name: 'Permitir capturar foto' }
        ]
      },
      {
        name: 'Carnetización',
        permissions: [
           { id: 'inst_carn_admin', name: 'Administración de Carnetización' },
           { id: 'inst_carn_gene', name: 'Generación de Carnets' }
        ]
      }
    ]
  },
  {
    name: 'Académico',
    categories: [
      {
        name: 'Estructuración',
        permissions: [
          { id: 'acad_estru_asig', name: 'Asignaturas' },
          { id: 'acad_estru_prog', name: 'Programas' },
          { id: 'acad_estru_curs', name: 'Cursos' },
          { id: 'acad_estru_cerr', name: 'Cerrar - Cursos' },
          { id: 'acad_estru_eval', name: 'Parámetros de evaluación' },
          { id: 'acad_estru_grup', name: 'Grupos' },
          { id: 'acad_estru_grad', name: 'Requisitos de grado' },
          { id: 'acad_estru_matr', name: 'Requisitos de matrícula' },
          { id: 'acad_estru_agru', name: 'Agrupaciones' },
          { id: 'acad_estru_esca', name: 'Escalas Valorativas' },
          { id: 'acad_estru_cons', name: 'Constancias y certificados' },
          { id: 'acad_estru_tipo_c', name: 'Tipos contratos' },
          { id: 'acad_estru_tipo_s', name: 'Tipos seguimientos prácticas' },
          { id: 'acad_estru_prac', name: 'Parámetros prácticas laborales' },
          { id: 'acad_estru_preg', name: 'Preguntas personalizadas programas' },
          { id: 'acad_estru_canc_t', name: 'Tipos cancelación' },
          { id: 'acad_estru_canc_c', name: 'Causas cancelación' },
          { id: 'acad_estru_rest', name: 'Restricciones de evaluación' },
          { id: 'acad_estru_admi', name: 'Administrar documentos de admisión' }
        ]
      },
      {
        name: 'Gestión',
        permissions: [
          { id: 'acad_gest_eval', name: 'Evaluación' },
          { id: 'acad_gest_hora', name: 'Horario' },
          { id: 'acad_gest_matr', name: 'Matriculas masivas a cursos' },
          { id: 'acad_gest_adap', name: 'Traslado masivo de estudiantes' },
          { id: 'acad_gest_cons', name: 'Consulta evaluaciones' }
        ]
      }
    ]
  },
  {
    name: 'Tesorería',
    categories: [
      {
        name: 'Gestión Financiera',
        permissions: [
          { id: 'teso_gest_desc', name: 'Descuentos' },
          { id: 'teso_gest_cart_c', name: 'Cartera - Créditos' },
          { id: 'teso_gest_cuad_c', name: 'Cuadre de caja por cajero' },
          { id: 'teso_gest_paz_m', name: 'Paz y salvo masivo' },
          { id: 'teso_gest_cuad_p', name: 'Cuadre de caja por producto' },
          { id: 'teso_gest_notc', name: 'Notas crédito' },
          { id: 'teso_gest_estuf', name: 'Estudiantes por estado financiero' },
          { id: 'teso_gest_egre', name: 'Egresos' },
          { id: 'teso_gest_ingr', name: 'Ingresos' },
          { id: 'teso_gest_anul', name: 'Anulaciones y devoluciones' },
          { id: 'teso_gest_proy', name: 'Proyección de recaudo' },
          { id: 'teso_gest_notcr', name: 'Consolidado notas crédito' },
          { id: 'teso_gest_obse', name: 'Créditos observaciones' },
          { id: 'teso_gest_paze', name: 'Informe paz y salvo establecidos' },
          { id: 'teso_gest_cart_g', name: 'Cartera general' },
          { id: 'teso_gest_ingrd', name: 'Ingresos detallados por producto' },
          { id: 'teso_gest_cart_p', name: 'Cartera - Pagos' },
          { id: 'teso_gest_reca_m', name: 'Recaudos masivos' },
          { id: 'teso_gest_conc_b', name: 'Conciliación bancaria' },
          { id: 'teso_gest_exen_i', name: 'Exenciones de impuestos' },
          { id: 'teso_gest_para_t', name: 'Parametrización tributaria' }
        ]
      },
      {
        name: 'Caja y Transacciones',
        permissions: [
           { id: 'teso_caja_aper', name: 'Apertura de caja' },
           { id: 'teso_caja_cier', name: 'Cierre de caja' },
           { id: 'teso_caja_gast', name: 'Registro de gastos' },
           { id: 'teso_caja_reca', name: 'Recaudos electrónicos' },
           { id: 'teso_caja_tras', name: 'Traslado entre cajas' },
           { id: 'teso_caja_base', name: 'Administración de base de caja' },
           { id: 'teso_caja_vouc', name: 'Gestión de vouchers' }
        ]
      },
      {
        name: 'Facturación y Cartera',
        permissions: [
          { id: 'teso_fact_auto', name: 'Facturación automática' },
          { id: 'teso_fact_elec', name: 'Facturación electrónica' },
          { id: 'teso_fact_reso', name: 'Resoluciones de facturación' },
          { id: 'teso_cart_esta', name: 'Estados de cuenta masivos' },
          { id: 'teso_cart_acue', name: 'Acuerdos de pago' },
          { id: 'teso_cart_mora', name: 'Cálculo de intereses de mora' },
          { id: 'teso_cart_noti', name: 'Notificaciones de cobro' }
        ]
      },
      {
        name: 'Configuración Financiera',
        permissions: [
          { id: 'teso_conf_conc', name: 'Conceptos de cobro' },
          { id: 'teso_conf_beca', name: 'Becas y auxilios' },
          { id: 'teso_conf_frac', name: 'Fraccionamientos' },
          { id: 'teso_conf_desc', name: 'Configuración de descuentos' },
          { id: 'teso_conf_banc', name: 'Entidades bancarias' },
          { id: 'teso_conf_pres', name: 'Presupuesto institucional' },
          { id: 'teso_conf_audt', name: 'Auditoría financiera' },
          { id: 'teso_conf_cier_a', name: 'Cierre anual' },
          { id: 'teso_conf_anti', name: 'Configuración de anticipos' },
          { id: 'teso_conf_refe', name: 'Referencias de pago' },
          { id: 'teso_conf_inte', name: 'Interfaz contable' },
          { id: 'teso_conf_vent', name: 'Puntos de venta' },
          { id: 'teso_conf_inve', name: 'Inventarios' },
          { id: 'teso_conf_prov', name: 'Proveedores' },
          { id: 'teso_conf_comp', name: 'Ordenes de compra' },
          { id: 'teso_conf_egre', name: 'Comprobantes de egreso' },
          { id: 'teso_conf_remi', name: 'Remisiones' },
          { id: 'teso_conf_devo', name: 'Devoluciones de saldo' },
          { id: 'teso_conf_ajus', name: 'Ajustes de cartera' },
          { id: 'teso_conf_tras_s', name: 'Traslado de saldos' },
          { id: 'teso_conf_bloq', name: 'Bloqueo financiero' },
          { id: 'teso_conf_reca_v', name: 'Recaudos por ventanilla' }
        ]
      }
    ]
  },
  {
    name: 'Informes',
    categories: [
      {
        name: 'Comunidad',
        permissions: [
          { id: 'info_comu_egre', name: 'Egresados' },
          { id: 'info_comu_estu', name: 'Estudiantes' },
          { id: 'info_comu_doce', name: 'Docentes' },
          { id: 'info_comu_admi', name: 'Administrativos' },
          { id: 'info_comu_prei', name: 'Preinscritos' },
          { id: 'info_comu_snie', name: 'Snies' }
        ]
      },
      {
        name: 'Gestión Académica',
        permissions: [
          { id: 'info_gest_notv', name: 'Histórico de notas' },
          { id: 'info_gest_estun', name: 'Estudiantes nuevos' },
          { id: 'info_gest_resu', name: 'Resultados académicos' },
          { id: 'info_gest_conn', name: 'Consolidado de notas' },
          { id: 'info_gest_pens', name: 'Resultados consolidado de pensum' },
          { id: 'info_gest_asig', name: 'Asignación académica docentes' },
          { id: 'info_gest_cuan', name: 'Diseño curricular cuantitativo' },
          { id: 'info_gest_list', name: 'Listado de matrículas' },
          { id: 'info_gest_preg', name: 'Informe preguntas personalizadas' },
          { id: 'info_gest_acud', name: 'Acudientes codeudores estudiante' },
          { id: 'info_gest_curs', name: 'Estudiantes por curso' },
          { id: 'info_gest_pend', name: 'Docentes pendientes por evaluar' },
          { id: 'info_gest_estam', name: 'Estadistica de matrículas' },
          { id: 'info_gest_contl', name: 'Informe control de acceso estudiantes' },
          { id: 'info_gest_canc', name: 'Estudiantes cancelados por inasistencia' },
          { id: 'info_gest_habi', name: 'Habilitaciones' },
          { id: 'info_gest_homo', name: 'Homologaciones' },
          { id: 'info_gest_rein', name: 'Reingresos' },
          { id: 'info_gest_detl', name: 'Q10 Control detallado' },
          { id: 'info_gest_inas', name: 'Consolidado de inasistencias' },
          { id: 'info_gest_prac_e', name: 'Informe de estudiantes por estado de practica' },
          { id: 'info_gest_prac_a', name: 'Estudiantes por asesor de prácticas' },
          { id: 'info_gest_matr_s', name: 'Consolidado matriculados por semestre' },
          { id: 'info_gest_prac_s', name: 'Estudiantes por estado de práctica' },
          { id: 'info_gest_matr_r', name: 'Informe requisitos de matrícula' },
          { id: 'info_gest_repr', name: 'Estudiantes asignaturas reprobadas' },
          { id: 'info_gest_segu', name: 'Seguimiento egresados' },
          { id: 'info_gest_fich', name: 'Fichas de matriculas' },
          { id: 'info_gest_inac', name: 'Inasistencias por curso' },
          { id: 'info_gest_inah', name: 'Histórico inasistencias' },
          { id: 'info_gest_obsv', name: 'Listado observador' },
          { id: 'info_gest_plan', name: 'Planilla estudiantes' },
          { id: 'info_gest_matr_i', name: 'Estudiantes matriculados' },
          { id: 'info_gest_insc_n', name: 'Inscritos aún no matriculados' },
          { id: 'info_gest_curs_l', name: 'Listado de cursos' },
          { id: 'info_gest_dese', name: 'Cancelados - Desertores' },
          { id: 'info_gest_difi', name: 'Estudiantes con dificultades' },
          { id: 'info_gest_entr', name: 'Entregas de trabajos' },
          { id: 'info_gest_foro', name: 'Participación en foros' },
          { id: 'info_gest_exam', name: 'Resultados exámenes online' },
          { id: 'info_gest_asit', name: 'Asistencia total por programa' },
          { id: 'info_gest_desa', name: 'Desarrollo curricular' },
          { id: 'info_gest_auto', name: 'Autoevaluaciones docentes' },
          { id: 'info_gest_enco', name: 'Encuestas de opinión' },
          { id: 'info_gest_carn', name: 'Carnetización masiva' },
          { id: 'info_gest_bole', name: 'Boletines de calificación' },
          { id: 'info_gest_cert', name: 'Certificados de estudio' },
          { id: 'info_gest_acta', name: 'Actas de grado' },
          { id: 'info_gest_libr', name: 'Libros de calificaciones' },
          { id: 'info_gest_paz_s', name: 'Paz y salvos académicos' },
          { id: 'info_gest_reti', name: 'Estudiantes retirados' },
          { id: 'info_gest_esta_c', name: 'Estadísticas de ocupación' },
          { id: 'info_gest_seg_d', name: 'Seguimiento a deserción' },
          { id: 'info_gest_moni', name: 'Monitoreo de aulas' },
          { id: 'info_gest_cober', name: 'Informe de cobertura' },
          { id: 'info_gest_vinc', name: 'Certificados de vinculación' },
          { id: 'info_gest_acud_e', name: 'Estudiantes por acudiente' },
          { id: 'info_gest_sald', name: 'Saldos a favor y cartera' }
        ]
      },
      {
        name: 'Seguridad',
        permissions: [
          { id: 'info_segu_admi', name: 'Permisos usuarios administrativos' },
          { id: 'info_segu_perf', name: 'Permisos asignados a perfiles' }
        ]
      }
    ]
  }
];
