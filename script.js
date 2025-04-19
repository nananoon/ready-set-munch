document.addEventListener('DOMContentLoaded', () => {
    // Restaurant database -> pick random restaurant from available options
    const restaurants = {
      comfort: [
        { name: "Gahwa", description: "A cozy spot with warm lighting and comforting food that feels like a hug for your soul." },
        { name: "Dokodemo", description: "Authentic comfort dishes that transport you to a place of culinary nostalgia." },
        { name: "Tosokchon", description: "Traditional recipes prepared with care, perfect for when you need familiar flavors." }
      ],
      uplifting: [
        { name: "Sisters", description: "Bright, cheerful atmosphere with food that lifts your spirits and energizes your day." },
        { name: "Brass Tusk Bar", description: "Vibrant ambiance with creative dishes that surprise and delight your palate." },
        { name: "Sartianos", description: "Elegant setting with uplifting cuisine that transforms your mood with every bite." }
      ],
      spicy: [
        { name: "Rynn", description: "Bold flavors and spices that awaken your senses and bring excitement to your meal." },
        { name: "Naks 1st Ave", description: "Fiery dishes that challenge your taste buds and bring a thrilling dining experience." },
        { name: "Adda", description: "Authentic spicy cuisine that balances heat with complex flavor profiles." }
      ],
      refreshing: [
        { name: "Apollo Bagels", description: "Fresh, light options that reinvigorate your body and mind with clean flavors." },
        { name: "Cafe2by2", description: "Refreshing menu items that cleanse your palate and leave you feeling renewed." },
        { name: "Avra", description: "Crisp, vibrant ingredients prepared simply to highlight their natural freshness." }
      ]
    };
  
    // Quiz state
    let currentPage = "intro.html";
    let answers = JSON.parse(localStorage.getItem('munchAnswers')) || {};
    let usedRecommendations = {};
    const totalQuestions = 5;
  
    // Page content container
    const pageContent = document.getElementById('pageContent');
    const progressBar = document.getElementById('progressBar');
  
    // Initialize
    loadPage('intro.html');
  
    // Functions
    async function loadPage(pageName) {
      try {
        // Show loading indicator
        showLoader();
        
        // Fetch the page content
        const response = await fetch(pageName);
        if (!response.ok) {
          throw new Error(`Failed to load page: ${pageName}`);
        }
        
        const html = await response.text();
        
        // Insert the page content
        pageContent.innerHTML = html;
        
        // Update current page
        currentPage = pageName;
        
        // Update progress bar
        updateProgressBar();
        
        // Reinitialize event listeners for the new page
        initializePageEventListeners();
        
        // Load saved answers if available
        loadSavedAnswers();
        
        // Handle results page
        if (pageName === 'results.html') {
          displayResults();
        }
        
        // Hide loading indicator
        hideLoader();
      } catch (error) {
        console.error('Error loading page:', error);
        hideLoader();
        
        // Fallback to intro page if there's an error
        if (pageName !== 'intro.html') {
          loadPage('intro.html');
        }
      }
    }
  
    function showLoader() {
      // Check if loader exists, if not create it
      let loader = document.querySelector('.loader');
      if (!loader) {
        loader = document.createElement('div');
        loader.className = 'loader';
        loader.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loader);
      }
      loader.classList.add('active');
    }
  
    function hideLoader() {
      const loader = document.querySelector('.loader');
      if (loader) {
        loader.classList.remove('active');
      }
    }
  
    function initializePageEventListeners() {
      // Navigation buttons
      document.querySelectorAll('.next-btn, .prev-btn').forEach(button => {
        const pageName = button.getAttribute('data-next') || button.getAttribute('data-prev');
        if (pageName) {
          button.addEventListener('click', () => loadPage(pageName));
        }
      });
      
      document.querySelectorAll('.restart-btn').forEach(button => {
        button.addEventListener('click', () => {
          // Reset answers and localStorage
          answers = {};
          localStorage.removeItem('munchAnswers');
      
          // Reset used recommendations
          usedRecommendations = {};
      
          // Go back to intro
          loadPage('intro.html');
        });
      });
      
  
      // Submit button
      const submitButton = document.querySelector('.submit-btn');
      if (submitButton) {
        submitButton.addEventListener('click', () => {
          if (validateAnswers()) {
            loadPage('results.html');
          } else {
            alert("Please answer all questions before revealing your match!");
          }
        });
      }
  
      // Another recommendation button
      const anotherButton = document.querySelector('.another-btn');
      if (anotherButton) {
        anotherButton.addEventListener('click', () => {
          displayResults(true);
        });
      }
  
      // Radio button listeners
      document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          const question = e.target.name;
          const answer = e.target.value;
          answers[question] = answer;
          saveAnswers();
        });
      });
    }
  
    function updateProgressBar() {
      // Calculate progress based on current page
      let progress = 0;
  
      if (currentPage === "intro.html") {
        progress = 0;
      } else if (currentPage === "results.html") {
        progress = 100;
      } else if (currentPage.startsWith("question")) {
        const questionNumber = parseInt(currentPage.match(/question(\d+)/)[1]);
        progress = (questionNumber / totalQuestions) * 100;
      }
  
      progressBar.style.width = `${progress}%`;
    }
  
    function loadSavedAnswers() {
      // Set radio buttons based on saved answers
      for (const question in answers) {
        const value = answers[question];
        const radio = document.querySelector(`input[name="${question}"][value="${value}"]`);
        if (radio) {
          radio.checked = true;
        }
      }
    }
  
    function saveAnswers() {
      localStorage.setItem('munchAnswers', JSON.stringify(answers));
    }
  
    function validateAnswers() {
      // Check if all questions are answered
      for (let i = 1; i <= totalQuestions; i++) {
        if (!answers[`q${i}`]) {
          return false;
        }
      }
      return true;
    }
  
    function tallyCategories() {
      // Count occurrences of each category
      const categoryCounts = {
        comfort: 0,
        uplifting: 0,
        spicy: 0,
        refreshing: 0
      };
  
      for (const question in answers) {
        const category = answers[question];
        if (categoryCounts.hasOwnProperty(category)) {
          categoryCounts[category]++;
        }
      }
  
      // Find the most frequent category
      let maxCount = 0;
      let topCategories = [];
  
      for (const category in categoryCounts) {
        if (categoryCounts[category] > maxCount) {
          maxCount = categoryCounts[category];
          topCategories = [category];
        } else if (categoryCounts[category] === maxCount) {
          topCategories.push(category);
        }
      }
  
      // If there's a tie, pick one randomly
      return topCategories[Math.floor(Math.random() * topCategories.length)];
    }
  
    function getRecommendation(category, getNew = false) {
      // Initialize category in used recommendations if not already
      if (!usedRecommendations[category]) {
        usedRecommendations[category] = [];
      }
  
      const categoryRestaurants = restaurants[category];
      let availableRestaurants = [];
  
      if (getNew && usedRecommendations[category].length < categoryRestaurants.length) {
        // Filter out already used recommendations
        availableRestaurants = categoryRestaurants.filter((_, index) => 
          !usedRecommendations[category].includes(index)
        );
      } else if (usedRecommendations[category].length >= categoryRestaurants.length || !getNew) {
        // If all recommendations have been used or it's the first recommendation
        availableRestaurants = categoryRestaurants;
        // Reset used recommendations for this category
        usedRecommendations[category] = [];
      }
  
      // Select a random restaurant from available ones
      const randomIndex = Math.floor(Math.random() * availableRestaurants.length);
      const restaurantIndex = categoryRestaurants.indexOf(availableRestaurants[randomIndex]);
      
      // Mark this recommendation as used
      usedRecommendations[category].push(restaurantIndex);
      
      return {
        ...availableRestaurants[randomIndex],
        category: formatCategoryName(category)
      };
    }
  
    function formatCategoryName(category) {
      switch(category) {
        case 'comfort': return 'Comfort Food';
        case 'uplifting': return 'Uplifting Experience';
        case 'spicy': return 'Spicy Adventure';
        case 'refreshing': return 'Refreshing Cuisine';
        default: return category;
      }
    }
  
    function displayResults(getNew = false) {
      const topCategory = tallyCategories();
      const recommendation = getRecommendation(topCategory, getNew);
  
      // Update result elements
      const restaurantName = document.getElementById('restaurantName');
      const restaurantCategory = document.getElementById('restaurantCategory');
      const restaurantDescription = document.getElementById('restaurantDescription');
  
      if (restaurantName && restaurantCategory && restaurantDescription) {
        restaurantName.textContent = recommendation.name;
        restaurantCategory.textContent = recommendation.category;
        restaurantDescription.textContent = recommendation.description;
      }
    }
  
    function resetQuiz() {
      // Clear answers
      answers = {};
      saveAnswers();
      loadPage('intro.html');
    }
  });