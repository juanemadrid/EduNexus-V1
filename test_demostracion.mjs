import puppeteer from 'puppeteer';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('Abriendo navegador en la pantalla del usuario...');
  const browser = await puppeteer.launch({ 
    headless: false, // ¡Abre Chrome visible en la pantalla del usuario!
    args: ['--start-maximized'],
    defaultViewport: null,
  });
  const page = await browser.newPage();

  try {
      console.log('Iniciando prueba en vivo...');
      await page.goto('http://localhost:3000/demo-init', { waitUntil: 'networkidle0' });
      await sleep(2000); 

      // 1. SEDES
      console.log('Navegando a Sedes y Jornadas...');
      await page.goto('http://localhost:3000/dashboard/academic/structuring/sede-jornada', { waitUntil: 'networkidle0' });
      await sleep(2000);

      console.log('Creando Sede...');
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent.includes('Nueva sede'));
          if (btn) btn.click();
      });
      await sleep(1000);
      
      await page.evaluate(() => document.querySelectorAll('.animate-fade input[type="text"]')[0].focus());
      await page.keyboard.type('SEDE BOGOTÁ VIRTUAL', { delay: 80 });
      await sleep(500);
      
      await page.evaluate(() => document.querySelectorAll('.animate-fade input[type="text"]')[1].focus());
      await page.keyboard.type('Calle 100 # 15-20', { delay: 60 });
      await sleep(1000);
      
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('.animate-fade button'));
          const save = btns.find(b => b.textContent.includes('Guardar'));
          if(save) save.click();
      });
      await sleep(2000);

      console.log('Creando Jornada...');
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent.includes('Nueva jornada'));
          if (btn) btn.click();
      });
      await sleep(1500);
      
      await page.evaluate(() => {
          const selects = document.querySelectorAll('.animate-fade select');
          if(selects.length > 0) {
             const options = Array.from(selects[0].options);
             const target = options.find(o => o.textContent.includes('SEDE BOGOTÁ VIRTUAL'));
             if (target) {
                 selects[0].value = target.value;
                 selects[0].dispatchEvent(new Event('change', { bubbles: true }));
             }
             if (selects[1]) {
                 selects[1].value = 'Noche';
                 selects[1].dispatchEvent(new Event('change', { bubbles: true }));
             }
          }
      });
      await sleep(1500);
      
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('.animate-fade button'));
          const save = btns.find(b => b.textContent.includes('Guardar'));
          if(save) save.click();
      });
      await sleep(2000);
      
      console.log('Asignando programas...');
      await page.evaluate(() => {
         const sels = document.querySelectorAll('select.input-premium');
         const options = Array.from(sels[0].options);
         const target = options.find(o => o.textContent.includes('SEDE BOGOTÁ VIRTUAL - Noche'));
         if(target) {
             sels[0].value = target.value;
             sels[0].dispatchEvent(new Event('change', { bubbles: true }));
         }
      });
      await sleep(1500);
      
      await page.evaluate(() => {
         const btns = Array.from(document.querySelectorAll('button'));
         const btn = btns.find(b => b.textContent.includes('Asignar programas'));
         if(btn) btn.click();
      });
      await sleep(1500);
      
      await page.evaluate(() => {
         const modals = document.querySelectorAll('.animate-fade');
         if (modals.length > 0) {
             const lastModal = modals[modals.length - 1];
             const items = lastModal.querySelectorAll('div[style*="cursor: pointer"]');
             if(items.length > 0) items[0].click();
         }
      });
      await sleep(1500);
      
      await page.evaluate(() => {
          const modals = document.querySelectorAll('.animate-fade');
          if (modals.length > 0) {
              const lastModal = modals[modals.length - 1];
              const save = Array.from(lastModal.querySelectorAll('button')).find(b => b.textContent.includes('Guardar'));
              if(save) save.click();
          }
      });
      await sleep(2000);

      // 2. CURSOS
      console.log('Navegando a Cursos...');
      await page.goto('http://localhost:3000/dashboard/academic/structuring/cursos', { waitUntil: 'networkidle0' });
      await sleep(2000);
      
      console.log('Llenando formulario de curso en cascada...');
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.textContent.includes('Crear curso'));
          if(btn) btn.click();
      });
      await sleep(1500);

      // Fill form visibly
      await page.evaluate(() => document.querySelectorAll('.animate-fade input[type="text"]')[0].focus());
      await page.keyboard.type('CUR-BOG-2026', { delay: 80 });
      await sleep(500);

      await page.evaluate(() => document.querySelectorAll('.animate-fade input[type="text"]')[1].focus());
      await page.keyboard.type('SISTEMAS BÁSICO - VIRTUAL', { delay: 80 });
      await sleep(1000);
      
      // Combos
      await page.evaluate(() => {
          const selects = document.querySelectorAll('.animate-fade select');
          if (selects.length > 0 && selects[0].options.length > 1) {
              selects[0].selectedIndex = 1; 
              selects[0].dispatchEvent(new Event('change', { bubbles: true }));
          }
      });
      await sleep(1000); 

      await page.evaluate(() => {
          const selects = document.querySelectorAll('.animate-fade select');
          if (selects.length > 1) {
              const sjOptions = Array.from(selects[1].options);
              const sjTarget = sjOptions.find(o => o.textContent.includes('SEDE BOGOTÁ VIRTUAL - Noche'));
              if(sjTarget) {
                  selects[1].value = sjTarget.value;
                  selects[1].dispatchEvent(new Event('change', { bubbles: true }));
              }
          }
      });
      await sleep(2000); 
      
      await page.evaluate(() => {
          const selects = document.querySelectorAll('.animate-fade select');
          if (selects.length > 2 && selects[2].options.length > 1) {
              selects[2].selectedIndex = 1; 
              selects[2].dispatchEvent(new Event('change', { bubbles: true }));
          }
      });
      await sleep(2000); 
      
      await page.evaluate(() => {
          const selects = document.querySelectorAll('.animate-fade select');
          if (selects.length > 3 && selects[3].options.length > 1) {
              selects[3].selectedIndex = 1; 
              selects[3].dispatchEvent(new Event('change', { bubbles: true }));
          }
      });
      await sleep(1000);
      
      await page.evaluate(() => {
          const selects = document.querySelectorAll('.animate-fade select');
          if (selects.length > 4 && selects[4].options.length > 1) {
              selects[4].selectedIndex = 1; 
              selects[4].dispatchEvent(new Event('change', { bubbles: true }));
          }
      });
      await sleep(2000);
      
      await page.evaluate(() => {
          const cupoInput = document.querySelector('.animate-fade input[type="number"]');
          if (cupoInput) {
              cupoInput.value = '35';
              cupoInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
          const dateInputs = document.querySelectorAll('.animate-fade input[type="date"]');
          if (dateInputs.length >= 2) {
              dateInputs[0].value = '2026-06-01'; 
              dateInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
              dateInputs[1].value = '2026-11-30'; 
              dateInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
          }
      });
      await sleep(2000);
      
      console.log('Guardando curso...');
      await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('.animate-fade button'));
          const save = btns.find(b => b.textContent.includes('Aceptar'));
          if(save) save.click();
      });
      await sleep(3000);
      
  } catch (err) {
      console.error(err);
  }

  console.log('Prueba terminada. El navegador se cerrará en 10 segundos.');
  await sleep(10000);
  await browser.close();
})();
