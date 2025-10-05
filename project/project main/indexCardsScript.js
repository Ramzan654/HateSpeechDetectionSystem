
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    const blogSections = document.querySelectorAll('.blog-section');
    const backButtons = document.querySelectorAll('.back-button');
    const cardSection = document.querySelector('.card-section');
    
    // Add click event to each card
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const blogType = this.getAttribute('data-blog');
            const targetSection = document.getElementById(`${blogType}-section`);
            
            // Hide card section and show specific blog section
            cardSection.style.display = 'none';
            
            // Hide all blog sections first
            blogSections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Show only the target blog section
            if (targetSection) {
                targetSection.style.display = 'block';
                // Scroll to the blog section
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Add click event to all back buttons
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Hide all blog sections
            blogSections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Show card section
            cardSection.style.display = 'block';
            
            // Scroll back to card section
            cardSection.scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Prevent default behavior for the "Discover More" links
    document.querySelectorAll('.card-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
        });
    });
});