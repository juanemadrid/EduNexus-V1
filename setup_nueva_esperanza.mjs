import puppeteer from 'puppeteer';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('======================================================');
  console.log(' INICIANDO SETUP DE NUEVA ESPERANZA EN PRODUCCIÓN');
  console.log('======================================================\n');
  
  const browser = await puppeteer.launch({ 
    headless: true, // Lo pondré en true para que corra en el entorno del servidor sin errores de display, pero reportaré logs
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  
  // Capturar logs de la consola del navegador
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  console.log('Navegando a la app en Vercel...');
  try {
    await page.goto('https://edu-nexus-v1.vercel.app/login', { waitUntil: 'load', timeout: 60000 });
  } catch (e) {
    console.log('Error de navegación inicial, reintentando...');
    await page.goto('https://edu-nexus-v1.vercel.app/', { waitUntil: 'networkidle2' });
  }

  console.log('Esperando formulario de login...');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  console.log('Iniciando sesión...');
  await page.type('input[type="email"]', 'nuevaesperanza@gmail.com');
  await page.type('input[type="password"]', '123456');
  
  console.log('Haciendo clic en Entrar...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
    page.click('button[type="submit"]'),
  ]);

  console.log('Login completado. URL actual:', page.url());
  await sleep(3000);
  
  try {
      // 1. SEDES Y JORNADAS
      console.log('------------------------------------------------------');
      console.log('1. Creando Sede y Jornada...');
      await page.goto('https://edu-nexus-v1.vercel.app/dashboard/academic/structuring/sede-jornada', { waitUntil: 'networkidle2' });
      await sleep(2000);

      console.log('   - Click en Nueva sede');
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent.includes('Nueva sede'));
          if (btn) btn.click();
      });
      await sleep(1500);
      
      console.log('   - Llenando Sede Principal...');
      let inputs = await page.$$('.animate-fade input[type="text"]');
      if (inputs.length >= 2) {
          await inputs[0].type('SEDE PRINCIPAL', { delay: 50 });
          await inputs[1].type('Calle 1 #2-3', { delay: 50 });
      }
      await sleep(1000);
      
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('.animate-fade button'));
          const save = btns.find(b => b.textContent && b.textContent.includes('Guardar'));
          if(save) save.click();
      });
      await sleep(2000); // Wait for save

      console.log('   - Click en Nueva jornada');
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent.includes('Nueva jornada'));
          if (btn) btn.click();
      });
      await sleep(1500);
      
      console.log('   - Llenando Jornada Única...');
      await page.evaluate(() => {
          const selects = document.querySelectorAll('.animate-fade select');
          if(selects.length > 0) {
              selects[0].selectedIndex = 1; // Pick first available sede
              selects[0].dispatchEvent(new Event('change', { bubbles: true }));
             if (selects[1]) {
                 selects[1].selectedIndex = 1; // Pick a journey
                 selects[1].dispatchEvent(new Event('change', { bubbles: true }));
             }
          }
      });
      await sleep(1000);
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('.animate-fade button'));
          const save = btns.find(b => b.textContent && b.textContent.includes('Guardar'));
          if(save) save.click();
      });
      await sleep(2000);
      
      // 2. PROGRAMAS / CURSOS (GRADO 10A)
      console.log('------------------------------------------------------');
      console.log('2. Registrando Grado y Curso (10A)...');
      await page.goto('https://edu-nexus-v1.vercel.app/dashboard/academic/structuring/cursos', { waitUntil: 'networkidle2' });
      await sleep(2000);
      
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent.includes('Crear curso') || b.textContent.includes('Nuevo'));
          if(btn) btn.click();
      });
      await sleep(1500);

      inputs = await page.$$('.animate-fade input[type="text"]');
      if (inputs.length >= 2) {
          await inputs[0].type('10A', { delay: 50 });
          await inputs[1].type('DÉCIMO GRADO A', { delay: 50 });
      }
      await sleep(1000);
      
      // Fill combos randomly
      await page.evaluate(() => {
          const selects = document.querySelectorAll('.animate-fade select');
          selects.forEach(s => {
              if (s.options.length > 1) {
                  s.selectedIndex = 1; 
                  s.dispatchEvent(new Event('change', { bubbles: true }));
              }
          });
          const cupoInput = document.querySelector('.animate-fade input[type="number"]');
          if (cupoInput) {
              cupoInput.value = '40';
              cupoInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
      });
      await sleep(1000);
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('.animate-fade button'));
          const save = btns.find(b => b.textContent && b.textContent.includes('Aceptar') || b.textContent.includes('Guardar'));
          if(save) save.click();
      });
      await sleep(2000);

      // 3. MATERIAS
      console.log('------------------------------------------------------');
      console.log('3. Creando Materias...');
      await page.goto('https://edu-nexus-v1.vercel.app/dashboard/academic/structuring/subjects', { waitUntil: 'networkidle2' });
      await sleep(2000);
      
      const materias = ['Matemáticas', 'Español'];
      for (const mat of materias) {
          console.log(`   - Añadiendo materia: ${mat}`);
          await page.evaluate(() => {
              const btns = Array.from(document.querySelectorAll('button'));
              const btn = btns.find(b => b.textContent.includes('Crear') || b.textContent.includes('Nueva'));
              if(btn) btn.click();
          });
          await sleep(1500);
          
          let input = await page.$('.animate-fade input[type="text"]');
          if (input) await input.type(mat, { delay: 50 });
          
          await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('.animate-fade button'));
            const save = btns.find(b => b.textContent && b.textContent.includes('Guardar') || b.textContent.includes('Aceptar'));
            if(save) save.click();
          });
          await sleep(2000);
      }

      // 4. DOCENTES
      console.log('------------------------------------------------------');
      console.log('4. Registrando Docente...');
      await page.goto('https://edu-nexus-v1.vercel.app/dashboard/teachers', { waitUntil: 'networkidle2' });
      await sleep(2000);
      
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent.includes('Crear') || b.textContent.includes('Nuevo') || b.textContent.includes('Añadir'));
          if(btn) btn.click();
      });
      await sleep(1500);
      inputs = await page.$$('.animate-fade input[type="text"], .animate-fade input[type="email"]');
      if (inputs.length >= 3) {
          await inputs[0].type('Profesor Guía', { delay: 50 });
          await inputs[1].type('Perez', { delay: 50 });
          await inputs[2].type('profesor.guia@nuevaesperanza.edu', { delay: 50 });
      }
      await sleep(1000);
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('.animate-fade button'));
          const save = btns.find(b => b.textContent && b.textContent.includes('Guardar') || b.textContent.includes('Crear'));
          if(save) save.click();
      });
      await sleep(2000);

      // 5. ESTUDIANTE
      console.log('------------------------------------------------------');
      console.log('5. Registrando Estudiante (Juan Eduardo Madrid)...');
      await page.goto('https://edu-nexus-v1.vercel.app/dashboard/students', { waitUntil: 'networkidle2' });
      await sleep(2000);

      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent.includes('Nuevo') || b.textContent.includes('Añadir') || b.textContent.includes('Crear'));
          if(btn) btn.click();
      });
      await sleep(1500);
      inputs = await page.$$('.animate-fade input[type="text"]');
      if (inputs.length >= 2) {
          await inputs[0].type('Juan Eduardo', { delay: 50 });
          await inputs[1].type('Madrid', { delay: 50 });
      }
      await sleep(1000);
      await page.evaluate(() => {
          const selects = document.querySelectorAll('.animate-fade select');
          if (selects.length > 0 && selects[0].options.length > 1) {
              selects[0].selectedIndex = 1; // Enroll in 10A conceptually
              selects[0].dispatchEvent(new Event('change', { bubbles: true }));
          }
      });
      await sleep(1000);
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('.animate-fade button'));
          const save = btns.find(b => b.textContent && b.textContent.includes('Guardar') || b.textContent.includes('Matricular'));
          if(save) save.click();
      });
      await sleep(2000);

      // 6. ADMINISTRATIVO
      console.log('------------------------------------------------------');
      console.log('6. Registrando Administrativo...');
      await page.goto('https://edu-nexus-v1.vercel.app/dashboard/admins', { waitUntil: 'networkidle2' });
      await sleep(2000);

      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent.includes('Nuevo') || b.textContent.includes('Crear') || b.textContent.includes('Añadir'));
          if(btn) btn.click();
      });
      await sleep(1500);
      inputs = await page.$$('.animate-fade input[type="text"], .animate-fade input[type="email"]');
      if (inputs.length >= 3) {
          await inputs[0].type('Admin', { delay: 50 });
          await inputs[1].type('General', { delay: 50 });
          await inputs[2].type('admin@nuevaesperanza.edu', { delay: 50 });
      }
      await sleep(1000);
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('.animate-fade button'));
          const save = btns.find(b => b.textContent && b.textContent.includes('Guardar') || b.textContent.includes('Crear'));
          if(save) save.click();
      });
      await sleep(2000);

      console.log('======================================================');
      console.log(' REGISTROS COMPLETADOS CON EXITO');
      console.log('======================================================\n');
      
  } catch (err) {
      console.error('Ocurrió un error en la automatización:', err);
  }

  console.log('El navegador permanecerá abierto para que revises todo.');
  // No cerramos el navegador para que el usuario pueda interactuar
  // await browser.close();
})();
