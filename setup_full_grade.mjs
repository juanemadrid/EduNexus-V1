import puppeteer from 'puppeteer';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('======================================================');
  console.log(' AMPLIANDO GRUPO: TODAS LAS MATERIAS Y DOCENTES (10A)');
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
  console.log('Asegurate de que la sesión esté abierta en NUEVA ESPERANZA.');
  console.log('Dando 15 segundos para revisión de sesión...');
  await sleep(15000);

  try {
      // 1. Añadir el resto de materias del currículo colombiano
      console.log('------------------------------------------------------');
      console.log('1. Añadiendo el resto de materias para Décimo Grado...');
      await page.goto('http://localhost:3000/dashboard/academic/structuring/subjects', { waitUntil: 'networkidle2' });
      await sleep(2000);
      
      const nuevasMaterias = [
          'Ciencias Naturales (Física)',
          'Ciencias Naturales (Química)',
          'Ciencias Sociales',
          'Inglés',
          'Educación Física',
          'Educación Ética y Valores',
          'Educación Artística',
          'Tecnología e Informática',
          'Filosofía'
      ];

      for (const mat of nuevasMaterias) {
          console.log(`   - Añadiendo materia: ${mat}`);
          await page.evaluate(() => {
              const btns = Array.from(document.querySelectorAll('button'));
              const btn = btns.find(b => b.textContent.includes('Crear') || b.textContent.includes('Nueva'));
              if(btn) btn.click();
          });
          await sleep(1500);
          
          const input = await page.$('.animate-fade input[type="text"]');
          if (input) await input.type(mat, { delay: 50 });
          
          await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('.animate-fade button'));
            const save = btns.find(b => b.textContent && (b.textContent.includes('Guardar') || b.textContent.includes('Aceptar')));
            if(save) save.click();
          });
          await sleep(2000);
      }

      // 2. DOCENTES ADICIONALES
      console.log('------------------------------------------------------');
      console.log('2. Registrando Docentes por Área...');
      const docentes = [
          { nombre: 'Pedro Alberto', apellido: 'Gómez', correo: 'pedro.ciencias@nuevaesperanza.edu' },
          { nombre: 'Ana Lucía', apellido: 'Martínez', correo: 'ana.humanidades@nuevaesperanza.edu' },
          { nombre: 'Luis Fernando', apellido: 'Rodríguez', correo: 'luis.tecnologia@nuevaesperanza.edu' },
      ];

      for (const doc of docentes) {
          console.log(`   - Registrando docente: ${doc.nombre} ${doc.apellido}`);
          await page.goto('http://localhost:3000/dashboard/teachers', { waitUntil: 'networkidle2' });
          await sleep(2000);
          
          await page.evaluate(() => {
              const btns = Array.from(document.querySelectorAll('button'));
              const btn = btns.find(b => b.textContent.includes('Crear') || b.textContent.includes('Nuevo') || b.textContent.includes('Añadir'));
              if(btn) btn.click();
          });
          await sleep(1500);
          
          const docInputs = await page.$$('.animate-fade input[type="text"], .animate-fade input[type="email"]');
          if (docInputs.length >= 3) {
              await docInputs[0].type(doc.nombre, { delay: 40 });
              await docInputs[1].type(doc.apellido, { delay: 40 });
              await docInputs[2].type(doc.correo, { delay: 40 });
          }
          await sleep(1000);
          
          await page.evaluate(() => {
              const btns = Array.from(document.querySelectorAll('.animate-fade button'));
              const save = btns.find(b => b.textContent && (b.textContent.includes('Guardar') || b.textContent.includes('Crear')));
              if(save) save.click();
          });
          await sleep(2500);
      }

      console.log('======================================================');
      console.log(' CURRICULO COMPLETO Y PLANTILLA DOCENTE REGISTRADA.');
      console.log('======================================================\n');
      
  } catch (err) {
      console.error('Ocurrió un error en la automatización:', err);
  }
})();
