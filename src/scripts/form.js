/*
 * Inquiry form — Formspree submission + success state.
 * Replace action with real endpoint before deploy.
 */

export function initForm() {
  const form = document.querySelector('[data-form]');
  if (!form) return;
  const status = form.querySelector('[data-form-status]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Honeypot check
    const honey = form.querySelector('input[name="website"]');
    if (honey && honey.value.trim() !== '') return; // silently drop

    const submitBtn = form.querySelector('.submit');
    if (submitBtn) submitBtn.disabled = true;

    const formData = new FormData(form);
    const action = form.getAttribute('action');

    try {
      const res = await fetch(action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        status.textContent = 'Thank you — Marcus will be in touch.';
        status.classList.add('shown');
        form.reset();
      } else {
        status.textContent = 'Something went wrong. Please email hello@thefloresmarket.com directly.';
        status.classList.add('shown');
      }
    } catch {
      status.textContent = 'Network issue. Please email hello@thefloresmarket.com directly.';
      status.classList.add('shown');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
