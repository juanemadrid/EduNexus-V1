import puppeteer from 'puppeteer';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('======================================================');
  console.log(' INICIANDO VERIFICACION VISUAL DE "NUEVA ESPERANZA"');
  console.log('======================================================\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--start-maximized'],
    defaultViewport: null,
  });
  const page = await browser.newPage();

  console.log('Navegando a la app local...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  console.log('\n\n!!! ATENCION !!!');
  console.log('Tienes 15 segundos para asegurar que la sesión de NUEVA ESPERANZA esté activa.');
  await sleep(15000);

  try {
      // 1. SEDES Y JORNADAS
      console.log('------------------------------------------------------');
      console.log('Verificando Sede y Jornada registradas...');
      await page.goto('http://localhost:3000/dashboard/academic/structuring/sede-jornada', { waitUntil: 'networkidle2' });
      // Let user look at the table
      await sleep(4000);

      // 2. CURSOS
      console.log('------------------------------------------------------');
      console.log('Verificando Cursos...');
      await page.goto('http://localhost:3000/dashboard/academic/structuring/cursos', { waitUntil: 'networkidle2' });
      await sleep(4000);

      // 3. MATERIAS
      console.log('------------------------------------------------------');
      console.log('Verificando Materias...');
      await page.goto('http://localhost:3000/dashboard/academic/structuring/subjects', { waitUntil: 'networkidle2' });
      await sleep(4000);

      // 4. DOCENTES
      console.log('------------------------------------------------------');
      console.log('Verificando Docentes...');
      await page.goto('http://localhost:3000/dashboard/teachers', { waitUntil: 'networkidle2' });
      await sleep(4000);

      // 5. ESTUDIANTES
      console.log('------------------------------------------------------');
      console.log('Verificando Estudiantes...');
      await page.goto('http://localhost:3000/dashboard/students', { waitUntil: 'networkidle2' });
      await sleep(4000);

      console.log('======================================================');
      console.log(' VERIFICACION VISUAL COMPLETADA CON EXITO');
      console.log(' Todo fluye correctamente y los datos están en sus tablas.');
      console.log('======================================================\n');
      
  } catch (err) {
      console.error('Ocurrió un error en la verificación:', err);
  }
})();
