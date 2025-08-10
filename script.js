document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM carregado - Iniciando aplicação');

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');

    mobileMenuBtn.addEventListener('click', function() {
        mobileNav.classList.toggle('active');
        this.querySelector('i').classList.toggle('fa-times');
        this.querySelector('i').classList.toggle('fa-bars');
    });

    // Fechar menu mobile
    const mobileLinks = document.querySelectorAll('.mobile-nav a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileNav.classList.remove('active');
            mobileMenuBtn.querySelector('i').classList.remove('fa-times');
            mobileMenuBtn.querySelector('i').classList.add('fa-bars');
        });
    });

    // Estado dos carrosseis
    const carouselsState = {};
    let productsByCategory = {};

    // Carrinho de compras
    let cart = [];
    const cartCount = document.querySelector('.cart-count');
    const cartIcon = document.querySelector('.cart-icon');

    // Função para carregar produtos do db.json
    async function loadProducts() {
        try {
            console.log('Carregando dados de json/db.json...');
            const response = await fetch('json/db.json');

            if (!response.ok) {
                throw new Error(`Erro HTTP! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Dados carregados com sucesso:', data);

            if (!data.productsByCategory) {
                console.warn('Estrutura productsByCategory não encontrada no JSON');
                return {};
            }
            return data.productsByCategory;

        } catch (error) {
            console.error('Falha ao carregar produtos:', error);
            return {};
        }
    }

    // Função para atualizar a posição do carrossel
    function updateCarousel(category) {
        const track = document.getElementById(`${category}-track`);
        const carouselContainer = document.querySelector(`.carousel-container[data-category="${category}"]`);
        
        if (!track || !carouselContainer || !carouselsState[category]) return;

        const state = carouselsState[category];
        const totalCards = productsByCategory[category].length;
        const visibleCards = Math.floor(carouselContainer.offsetWidth / state.cardWidth);
        let position = state.position;
        
        // Limita a posição para não ir além do fim ou do início
        const maxPosition = totalCards > visibleCards ? totalCards - visibleCards : 0;
        
        if (position < 0) {
            position = 0;
        } else if (position > maxPosition) {
            position = maxPosition;
        }

        state.position = position;
        const transformValue = `translateX(-${position * state.cardWidth}px)`;
        track.style.transform = transformValue;
    }

    // Função para adicionar os event listeners aos botões do carrossel
    function addEventListenersToCarousels() {
        const carouselButtons = document.querySelectorAll('.carousel-btn');
        carouselButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.dataset.category;
                const state = carouselsState[category];

                if (!state) return;

                if (this.classList.contains('next-btn')) {
                    state.position++;
                } else if (this.classList.contains('prev-btn')) {
                    state.position--;
                }

                updateCarousel(category);
            });
        });
    }

    // Função para inicializar todos os carrosséis
    async function initCarousels() {
        productsByCategory = await loadProducts();
        console.log('Produtos por categoria:', productsByCategory);

        const cardWidth = 280; // Largura do card + margem

        Object.keys(productsByCategory).forEach(category => {
            const track = document.getElementById(`${category}-track`);
            if (!track) {
                console.warn(`Elemento do carrossel não encontrado: ${category}-track`);
                return;
            }

            track.innerHTML = '';
            
            if (productsByCategory[category].length === 0) {
                track.innerHTML = '<p class="no-products">Nenhum produto disponível</p>';
                return;
            }

            productsByCategory[category].forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';

                let imagePath = product.image;
                if (!imagePath.startsWith('public/') && !imagePath.startsWith('http')) {
                    imagePath = `public/${imagePath}`;
                }

                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="${imagePath}" alt="${product.name}" 
                             onerror="this.onerror=null;this.src='public/placeholder.png'">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <div class="product-price">
                            <span class="price">R$ ${product.price.toFixed(2)}</span>
                            <button class="add-to-cart" data-id="${product.id}">Adicionar</button>
                        </div>
                    </div>
                `;
                track.appendChild(productCard);
            });
            
            carouselsState[category] = {
                position: 0,
                cardWidth: cardWidth,
                visibleCards: Math.floor(window.innerWidth / cardWidth) || 1
            };
            
            updateCarousel(category);
        });
    }

    // Inicialização da aplicação
    await initCarousels();
    addEventListenersToCarousels();
    console.log('Aplicação inicializada com sucesso');

    // [Restante do código para o carrinho de compras pode ser adicionado aqui]
});

// Hero Carousel Functionality
function initHeroCarousel() {
  const track = document.querySelector('.hero-track');
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const prevBtn = document.querySelector('.hero-prev-btn');
  const nextBtn = document.querySelector('.hero-next-btn');
  const indicators = Array.from(document.querySelectorAll('.indicator'));
  
  let currentIndex = 0;
  let autoSlideInterval;
  const slideInterval = 5000; // 5 segundos
  
  // Função para atualizar a posição do carrossel
  function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Atualiza indicadores
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === currentIndex);
    });
    
    // Atualiza slides
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === currentIndex);
    });
  }
  
  // Navegação para o slide anterior
  function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel();
    resetAutoSlide();
  }
  
  // Navegação para o próximo slide
  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
    resetAutoSlide();
  }
  
  // Inicia o slideshow automático
  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, slideInterval);
  }
  
  // Reseta o temporizador do slideshow
  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }
  
  // Event listeners
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);
  
  // Navegação pelos indicadores
  indicators.forEach(indicator => {
    indicator.addEventListener('click', function() {
      currentIndex = parseInt(this.getAttribute('data-slide'));
      updateCarousel();
      resetAutoSlide();
    });
  });
  
  // Inicia o carrossel
  updateCarousel();
  startAutoSlide();
  
  // Pausa o slideshow quando o mouse está sobre o carrossel
  const heroCarousel = document.querySelector('.hero-carousel');
  heroCarousel.addEventListener('mouseenter', () => {
    clearInterval(autoSlideInterval);
  });
  
  heroCarousel.addEventListener('mouseleave', () => {
    startAutoSlide();
  });
}

// Inicializa o carrossel hero quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  initHeroCarousel();
  // ... (outro código de inicialização)
});