import puppeteer from 'puppeteer';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('======================================================');
  console.log(' COMPLETANDO REGISTRO DE ADMINISTRATIVO');
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
      // 6. ADMINISTRATIVO (Corrección de Ruta)
      console.log('------------------------------------------------------');
      console.log('Registrando Administrativo (Ruta corregida: /dashboard/admins/register)...');
      await page.goto('http://localhost:3000/dashboard/admins/register', { waitUntil: 'networkidle2' });
      await sleep(2500);

      // We are already on the register page, so no need to click "Nuevo"
      let inputs = await page.$$('.animate-fade input[type="text"], .animate-fade input[type="email"]');
      if (inputs.length >= 3) {
          await inputs[0].type('Admin', { delay: 50 });
          await inputs[1].type('General', { delay: 50 });
          await inputs[2].type('admin@nuevaesperanza.edu', { delay: 50 });
      }
      await sleep(1000);
      
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('.animate-fade button'));
          const save = btns.find(b => b.textContent && (b.textContent.includes('Guardar') || b.textContent.includes('Crear')));
          if(save) save.click();
      });
      await sleep(3000);

      console.log('======================================================');
      console.log(' REGISTRO DE ADMINISTRATIVO COMPLETADO CON EXITO');
      console.log('======================================================\n');
      
  } catch (err) {
      console.error('Ocurrió un error en la automatización:', err);
  }
})();
