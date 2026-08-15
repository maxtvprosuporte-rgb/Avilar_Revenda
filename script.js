function toggleFAQ(btn){
    const item = btn.parentElement;
    const wasActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if(!wasActive) item.classList.add('active');
}
