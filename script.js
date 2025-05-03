// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set up theme colors based on Telegram Mini App environment
    setupThemeColors();

    // Get DOM elements
    const searchInput = document.getElementById('searchInput');
    const methodsList = document.getElementById('methods-list');
    const typesList = document.getElementById('types-list');

    // Store the API data
    let apiData = null;

    // Function to set up theme colors
    function setupThemeColors() {
        // Check if running in Telegram Mini App
        if (window.Telegram && window.Telegram.WebApp) {
            const webApp = window.Telegram.WebApp;

            // Apply theme colors
            applyTelegramTheme(webApp);

            // Listen for theme changes
            webApp.onEvent('themeChanged', function() {
                applyTelegramTheme(webApp);
            });

            console.log('Running in Telegram Mini App, theme applied');
        } else {
            console.log('Not running in Telegram Mini App, using default theme');
        }
    }

    // Function to apply Telegram theme colors
    function applyTelegramTheme(webApp) {
        // Get theme colors from Telegram
        const themeParams = webApp.themeParams;

        // Set CSS variables based on Telegram theme
        document.documentElement.style.setProperty('--bg-color', themeParams.bg_color || '#f5f5f5');
        document.documentElement.style.setProperty('--container-bg-color', themeParams.secondary_bg_color || 'white');
        document.documentElement.style.setProperty('--section-bg-color', themeParams.secondary_bg_color || '#f9f9f9');
        document.documentElement.style.setProperty('--field-item-bg-color', themeParams.secondary_bg_color || '#f5f5f5');
        document.documentElement.style.setProperty('--error-bg-color', '#fdf7f7'); // Keep error background similar

        document.documentElement.style.setProperty('--primary-color', themeParams.button_color || '#0088cc');
        document.documentElement.style.setProperty('--heading-color', themeParams.text_color || '#333');
        document.documentElement.style.setProperty('--text-color', themeParams.hint_color || '#666');
        document.documentElement.style.setProperty('--link-hover-color', themeParams.link_color || '#005580');
        document.documentElement.style.setProperty('--error-color', '#e74c3c'); // Keep error color red

        document.documentElement.style.setProperty('--border-color', themeParams.hint_color || '#eee');
        document.documentElement.style.setProperty('--input-border-color', themeParams.hint_color || '#ddd');

        // Set required badge text color based on contrast with background
        document.documentElement.style.setProperty('--required-badge-text', isDarkColor(themeParams.button_color) ? 'white' : 'black');

        // Adapt to Telegram color scheme
        webApp.setHeaderColor(themeParams.bg_color);
        webApp.setBackgroundColor(themeParams.bg_color);
    }

    // Helper function to determine if a color is dark
    function isDarkColor(hexColor) {
        if (!hexColor) return true; // Default to assuming dark

        // Remove # if present
        hexColor = hexColor.replace('#', '');

        // Convert to RGB
        const r = parseInt(hexColor.substr(0, 2), 16);
        const g = parseInt(hexColor.substr(2, 2), 16);
        const b = parseInt(hexColor.substr(4, 2), 16);

        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // Return true if dark, false if light
        return luminance < 0.5;
    }

    // Fetch the API JSON data from remote URL
    fetch('https://raw.githubusercontent.com/PaulSonOfLars/telegram-bot-api-spec/refs/heads/main/api.min.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            apiData = data;
            displayData(apiData);

            // Add event listener for search input
            searchInput.addEventListener('input', function() {
                filterData(apiData, this.value.trim().toLowerCase());
            });
        })
        .catch(error => {
            console.error('Error fetching API data:', error);
            methodsList.innerHTML = '<p class="error">Error loading API data. Please try again later.</p>';
            typesList.innerHTML = '<p class="error">Error loading API data. Please try again later.</p>';
        });

    // Function to display methods and types
    function displayData(data) {
        // Display version info
        displayVersionInfo(data);

        displayMethods(data.methods);
        displayTypes(data.types);
    }

    // Function to display version info
    function displayVersionInfo(data) {
        const versionInfoElement = document.getElementById('version-info');
        if (data.version && data.release_date && data.changelog) {
            versionInfoElement.innerHTML = `${data.version} (${data.release_date}) - <a href="${data.changelog}" target="_blank">Changelog</a>`;
        }
    }

    // Function to display methods
    function displayMethods(methods) {
        methodsList.innerHTML = '';

        if (!methods || Object.keys(methods).length === 0) {
            methodsList.innerHTML = '<p>No methods available.</p>';
            return;
        }

        for (const key in methods) {
            const method = methods[key];
            const methodElement = createItemElement(method, 'method');
            methodsList.appendChild(methodElement);
        }
    }

    // Function to display types
    function displayTypes(types) {
        typesList.innerHTML = '';

        if (!types || Object.keys(types).length === 0) {
            typesList.innerHTML = '<p>No types available.</p>';
            return;
        }

        for (const key in types) {
            const type = types[key];
            const typeElement = createItemElement(type, 'type');
            typesList.appendChild(typeElement);
        }
    }

    // Function to create an item element
    function createItemElement(item, itemType) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';

        const nameElement = document.createElement('div');
        nameElement.className = 'item-name';
        nameElement.textContent = item.name;

        const descElement = document.createElement('div');
        descElement.className = 'item-description';

        // Add link to Telegram docs
        if (item.href) {
            const linkDiv = document.createElement('div');
            linkDiv.className = 'telegram-link-section';

            const linkElement = document.createElement('a');
            linkElement.href = item.href;
            linkElement.target = '_blank';
            linkElement.textContent = 'View in Telegram Bot API Documentation';
            linkElement.className = 'telegram-docs-link';

            linkDiv.appendChild(linkElement);
            descElement.appendChild(linkDiv);
        }

        // Add description
        if (item.description && item.description.length > 0) {
            const descriptionDiv = document.createElement('div');
            descriptionDiv.className = 'description-section';

            const descTitle = document.createElement('h3');
            descTitle.textContent = 'Description';
            descriptionDiv.appendChild(descTitle);

            const descText = document.createElement('p');
            descText.textContent = item.description.join(' ');
            descriptionDiv.appendChild(descText);

            descElement.appendChild(descriptionDiv);
        }

        // Add returns section for methods
        if (itemType === 'method' && item.returns && item.returns.length > 0) {
            const returnsDiv = document.createElement('div');
            returnsDiv.className = 'returns-section';

            const returnsTitle = document.createElement('h3');
            returnsTitle.textContent = 'Returns';
            returnsDiv.appendChild(returnsTitle);

            const returnsText = document.createElement('p');
            returnsText.textContent = item.returns.join(', ');
            returnsDiv.appendChild(returnsText);

            descElement.appendChild(returnsDiv);
        }

        // Add fields section
        if (item.fields && item.fields.length > 0) {
            const fieldsDiv = document.createElement('div');
            fieldsDiv.className = 'fields-section';

            const fieldsTitle = document.createElement('h3');
            fieldsTitle.textContent = 'Fields';
            fieldsDiv.appendChild(fieldsTitle);

            const fieldsList = document.createElement('ul');
            fieldsList.className = 'fields-list';

            item.fields.forEach(field => {
                const fieldItem = document.createElement('li');
                fieldItem.className = 'field-item';

                const fieldName = document.createElement('div');
                fieldName.className = 'field-name';
                fieldName.textContent = field.name;

                if (field.required) {
                    const requiredBadge = document.createElement('span');
                    requiredBadge.className = 'required-badge';
                    requiredBadge.textContent = 'Required';
                    fieldName.appendChild(requiredBadge);
                }

                fieldItem.appendChild(fieldName);

                const fieldType = document.createElement('div');
                fieldType.className = 'field-type';
                fieldType.textContent = 'Type: ' + field.types.join(', ');
                fieldItem.appendChild(fieldType);

                if (field.description) {
                    const fieldDesc = document.createElement('div');
                    fieldDesc.className = 'field-description';
                    fieldDesc.textContent = field.description;
                    fieldItem.appendChild(fieldDesc);
                }

                fieldsList.appendChild(fieldItem);
            });

            fieldsDiv.appendChild(fieldsList);
            descElement.appendChild(fieldsDiv);
        }

        itemDiv.appendChild(nameElement);
        itemDiv.appendChild(descElement);

        // Add click event to toggle expanded state (on the entire item except for the description)
        itemDiv.addEventListener('click', function(event) {
            // Prevent the click from triggering if the link was clicked or if clicked on description
            if (event.target.tagName === 'A' || descElement.contains(event.target)) {
                event.stopPropagation();
                return;
            }

            this.classList.toggle('expanded');
        });

        return itemDiv;
    }

    // Function to filter data based on search input
    function filterData(data, searchTerm) {
        if (!data) return;

        // Filter methods
        const filteredMethods = {};
        for (const key in data.methods) {
            const method = data.methods[key];

            // Check if search term is in method name or description
            let matchFound = 
                method.name.toLowerCase().includes(searchTerm) || 
                method.description.join(' ').toLowerCase().includes(searchTerm);

            // Check if search term is in returns
            if (!matchFound && method.returns) {
                matchFound = method.returns.join(' ').toLowerCase().includes(searchTerm);
            }

            // Check if search term is in fields
            if (!matchFound && method.fields) {
                for (const field of method.fields) {
                    if (
                        field.name.toLowerCase().includes(searchTerm) ||
                        (field.description && field.description.toLowerCase().includes(searchTerm)) ||
                        field.types.join(' ').toLowerCase().includes(searchTerm)
                    ) {
                        matchFound = true;
                        break;
                    }
                }
            }

            if (matchFound) {
                filteredMethods[key] = method;
            }
        }

        // Filter types
        const filteredTypes = {};
        for (const key in data.types) {
            const type = data.types[key];

            // Check if search term is in type name or description
            let matchFound = 
                type.name.toLowerCase().includes(searchTerm) || 
                type.description.join(' ').toLowerCase().includes(searchTerm);

            // Check if search term is in fields
            if (!matchFound && type.fields) {
                for (const field of type.fields) {
                    if (
                        field.name.toLowerCase().includes(searchTerm) ||
                        (field.description && field.description.toLowerCase().includes(searchTerm)) ||
                        field.types.join(' ').toLowerCase().includes(searchTerm)
                    ) {
                        matchFound = true;
                        break;
                    }
                }
            }

            if (matchFound) {
                filteredTypes[key] = type;
            }
        }

        // Display filtered data
        displayMethods(filteredMethods);
        displayTypes(filteredTypes);
    }
});
