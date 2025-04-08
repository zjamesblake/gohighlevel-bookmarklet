// GoHighLevel Form Extraction Script
// Main script to be hosted on GitHub

(function() {
  // Configuration
  const formBaseUrl = 'https://api.leadconnectorhq.com/widget/form/rpBMjFJzdISFJTYMWgQV';
  const locationId = 'ND1DMa5sDNocNbpseXWv';
  
  // Main data object to store all extracted information
  let extractedData = {
    request_type: 'Part of an Existing Project' // Always set this value as required
  };
  
  // Helper functions
  function sanitizeFieldName(fieldName) {
    return fieldName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  }
  
  function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }
  
  function getOpportunityId() {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1];
  }
  
  function getCurrentTab() {
    return getUrlParameter('tab');
  }
  
  function createOverlay(url) {
    // Create overlay container
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '20px';
    closeButton.style.right = '20px';
    closeButton.style.padding = '10px 15px';
    closeButton.style.background = '#f44336';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '16px';
    closeButton.style.zIndex = '10002';
    closeButton.onclick = function() {
      document.body.removeChild(overlay);
    };
    
    // Create iframe for the form
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '90%';
    iframe.style.height = '90%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '5px';
    iframe.style.backgroundColor = 'white';
    iframe.style.zIndex = '10001';
    
    // Append elements
    overlay.appendChild(closeButton);
    overlay.appendChild(iframe);
    document.body.appendChild(overlay);
  }
  
  // Extract data from Contact Page
  async function extractContactData() {
    // Extract name
    const nameElement = document.querySelector('.contact-header-name h1');
    if (nameElement) {
      extractedData.name = nameElement.textContent.trim();
    }
    
    // Extract email and phone
    const contactInfoItems = document.querySelectorAll('.contact-detail-item');
    contactInfoItems.forEach(item => {
      const label = item.querySelector('.label');
      const value = item.querySelector('.value');
      
      if (label && value) {
        const labelText = label.textContent.trim().toLowerCase();
        const valueText = value.textContent.trim();
        
        if (labelText.includes('email')) {
          extractedData.email = valueText;
        } else if (labelText.includes('phone')) {
          extractedData.phone_number = valueText;
        }
      }
    });
  }
  
  // Extract data from Opportunity Details tab
  async function extractOpportunityDetailsData() {
    // Extract primary contact name
    const contactNameElement = document.querySelector('.opportunity-contact-name');
    if (contactNameElement) {
      extractedData.primary_contact_name = contactNameElement.textContent.trim();
    }
    
    // Extract primary email
    const emailElements = document.querySelectorAll('.contact-info-item');
    emailElements.forEach(item => {
      const icon = item.querySelector('i');
      const value = item.querySelector('.value');
      
      if (icon && value && icon.classList.contains('fa-envelope')) {
        extractedData.primary_email = value.textContent.trim();
      }
    });
    
    // Extract job ID (usually in the opportunity title or ID field)
    const opportunityTitleElement = document.querySelector('.opportunity-title h1');
    if (opportunityTitleElement) {
      const titleText = opportunityTitleElement.textContent.trim();
      // Look for a pattern like "JOB-12345" in the title
      const jobIdMatch = titleText.match(/\b([A-Z]+-\d+|\d+)\b/);
      if (jobIdMatch) {
        extractedData.job_id = jobIdMatch[0];
      } else {
        extractedData.job_id = titleText; // Use full title if no clear job ID format
      }
    }
  }
  
  // Extract data from Request Form tab
  async function extractRequestFormData() {
    const formItems = document.querySelectorAll('.n-form-item-blank');
    
    formItems.forEach(item => {
      // Find the label
      const labelElement = item.querySelector('.n-form-item-label');
      if (!labelElement) return;
      
      const labelText = labelElement.textContent.trim();
      if (!labelText) return;
      
      const fieldName = sanitizeFieldName(labelText);
      
      // Find the value based on input type
      // Check for regular input
      const inputElement = item.querySelector('input[type="text"], input[type="number"], input[type="email"]');
      if (inputElement) {
        extractedData[fieldName] = inputElement.value.trim();
        return;
      }
      
      // Check for textarea
      const textareaElement = item.querySelector('textarea');
      if (textareaElement) {
        extractedData[fieldName] = textareaElement.value.trim();
        return;
      }
      
      // Check for select dropdown
      const selectElement = item.querySelector('select');
      if (selectElement) {
        extractedData[fieldName] = selectElement.value.trim();
        return;
      }
      
      // Check for radio buttons
      const checkedRadio = item.querySelector('input[type="radio"]:checked');
      if (checkedRadio) {
        const radioLabel = checkedRadio.closest('label');
        if (radioLabel) {
          extractedData[fieldName] = radioLabel.textContent.trim();
        } else {
          extractedData[fieldName] = checkedRadio.value;
        }
        return;
      }
      
      // Check for checkboxes
      const checkedBoxes = item.querySelectorAll('input[type="checkbox"]:checked');
      if (checkedBoxes.length > 0) {
        const values = Array.from(checkedBoxes).map(box => {
          const boxLabel = box.closest('label');
          return boxLabel ? boxLabel.textContent.trim() : box.value;
        });
        extractedData[fieldName] = values.join(', ');
        return;
      }
      
      // If we can't determine the input type, try to get any visible text that might be the value
      const valueElement = item.querySelector('.n-form-item-content');
      if (valueElement) {
        const visibleText = Array.from(valueElement.childNodes)
          .filter(node => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('n-form-item-label')))
          .map(node => node.textContent.trim())
          .join(' ')
          .trim();
        
        if (visibleText) {
          extractedData[fieldName] = visibleText;
        }
      }
    });
  }
  
  // Navigate to another tab and extract data
  async function navigateAndExtract(tab) {
    return new Promise((resolve, reject) => {
      // Save current URL to return later
      const currentUrl = window.location.href;
      const opportunityId = getOpportunityId();
      
      // Construct URL for the target tab
      const tabUrl = `https://app.gohighlevel.com/v2/location/${locationId}/opportunities/list/${opportunityId}?tab=${encodeURIComponent(tab)}`;
      
      // Create hidden iframe to load the other tab
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.src = tabUrl;
      
      // Set a timeout in case the load fails
      const timeout = setTimeout(() => {
        document.body.removeChild(iframe);
        reject(new Error(`Timeout while loading ${tab} tab`));
      }, 15000); // 15 seconds timeout
      
      iframe.onload = async function() {
        clearTimeout(timeout);
        
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          
          // Wait for page to fully load
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Extract data based on the tab
          if (tab === 'Opportunity Details') {
            // Create a function that runs in the iframe context
            const extractFunction = function() {
              const data = {};
              
              // Extract primary contact name
              const contactNameElement = document.querySelector('.opportunity-contact-name');
              if (contactNameElement) {
                data.primary_contact_name = contactNameElement.textContent.trim();
              }
              
              // Extract primary email
              const emailElements = document.querySelectorAll('.contact-info-item');
              emailElements.forEach(item => {
                const icon = item.querySelector('i');
                const value = item.querySelector('.value');
                
                if (icon && value && icon.classList.contains('fa-envelope')) {
                  data.primary_email = value.textContent.trim();
                }
              });
              
              // Extract job ID (usually in the opportunity title or ID field)
              const opportunityTitleElement = document.querySelector('.opportunity-title h1');
              if (opportunityTitleElement) {
                const titleText = opportunityTitleElement.textContent.trim();
                // Look for a pattern like "JOB-12345" in the title
                const jobIdMatch = titleText.match(/\b([A-Z]+-\d+|\d+)\b/);
                if (jobIdMatch) {
                  data.job_id = jobIdMatch[0];
                } else {
                  data.job_id = titleText; // Use full title if no clear job ID format
                }
              }
              
              return data;
            };
            
            // Execute the function in iframe context and get the results
            const result = iframe.contentWindow.eval(`(${extractFunction.toString()})()`);
            Object.assign(extractedData, result);
          } else if (tab === 'Request Form') {
            // Define extraction function for Request Form tab
            const extractFunction = function() {
              const data = {};
              const formItems = document.querySelectorAll('.n-form-item-blank');
              
              formItems.forEach(item => {
                // Find the label
                const labelElement = item.querySelector('.n-form-item-label');
                if (!labelElement) return;
                
                const labelText = labelElement.textContent.trim();
                if (!labelText) return;
                
                const fieldName = labelText.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                
                // Find the value based on input type
                // Check for regular input
                const inputElement = item.querySelector('input[type="text"], input[type="number"], input[type="email"]');
                if (inputElement) {
                  data[fieldName] = inputElement.value.trim();
                  return;
                }
                
                // Check for textarea
                const textareaElement = item.querySelector('textarea');
                if (textareaElement) {
                  data[fieldName] = textareaElement.value.trim();
                  return;
                }
                
                // Check for select dropdown
                const selectElement = item.querySelector('select');
                if (selectElement) {
                  data[fieldName] = selectElement.value.trim();
                  return;
                }
                
                // Check for radio buttons
                const checkedRadio = item.querySelector('input[type="radio"]:checked');
                if (checkedRadio) {
                  const radioLabel = checkedRadio.closest('label');
                  if (radioLabel) {
                    data[fieldName] = radioLabel.textContent.trim();
                  } else {
                    data[fieldName] = checkedRadio.value;
                  }
                  return;
                }
                
                // Check for checkboxes
                const checkedBoxes = item.querySelectorAll('input[type="checkbox"]:checked');
                if (checkedBoxes.length > 0) {
                  const values = Array.from(checkedBoxes).map(box => {
                    const boxLabel = box.closest('label');
                    return boxLabel ? boxLabel.textContent.trim() : box.value;
                  });
                  data[fieldName] = values.join(', ');
                  return;
                }
                
                // If we can't determine the input type, try to get any visible text that might be the value
                const valueElement = item.querySelector('.n-form-item-content');
                if (valueElement) {
                  const visibleText = Array.from(valueElement.childNodes)
                    .filter(node => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('n-form-item-label')))
                    .map(node => node.textContent.trim())
                    .join(' ')
                    .trim();
                  
                  if (visibleText) {
                    data[fieldName] = visibleText;
                  }
                }
              });
              
              return data;
            };
            
            // Execute the function in iframe context and get the results
            const result = iframe.contentWindow.eval(`(${extractFunction.toString()})()`);
            Object.assign(extractedData, result);
          }
          
          // Remove the iframe
          document.body.removeChild(iframe);
          
          // Navigate back to original URL if needed
          if (window.location.href !== currentUrl) {
            window.location.href = currentUrl;
            // Add small delay to let navigation complete
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          resolve();
        } catch (error) {
          document.body.removeChild(iframe);
          reject(error);
        }
      };
      
      iframe.onerror = function() {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        reject(new Error(`Failed to load ${tab} tab`));
      };
      
      document.body.appendChild(iframe);
    });
  }
  
  // Build URL with parameters
  function buildFormUrl() {
    const url = new URL(formBaseUrl);
    
    // Add all extracted data as URL parameters
    Object.keys(extractedData).forEach(key => {
      if (extractedData[key]) {
        url.searchParams.append(key, extractedData[key]);
      }
    });
    
    return url.toString();
  }
  
  // Main execution flow
  async function main() {
    try {
      const currentUrl = window.location.href;
      
      // Show a loading message
      const loadingMessage = document.createElement('div');
      loadingMessage.style.position = 'fixed';
      loadingMessage.style.top = '50%';
      loadingMessage.style.left = '50%';
      loadingMessage.style.transform = 'translate(-50%, -50%)';
      loadingMessage.style.background = 'rgba(0, 0, 0, 0.8)';
      loadingMessage.style.color = 'white';
      loadingMessage.style.padding = '20px';
      loadingMessage.style.borderRadius = '10px';
      loadingMessage.style.zIndex = '10000';
      loadingMessage.style.fontSize = '18px';
      loadingMessage.textContent = 'Loading data, please wait...';
      document.body.appendChild(loadingMessage);
      
      // Determine page type and extract data
      if (currentUrl.includes('/contacts/detail/')) {
        // Contact Page
        await extractContactData();
      } else if (currentUrl.includes('/opportunities/list/')) {
        const currentTab = getCurrentTab();
        
        if (currentTab === 'Opportunity Details') {
          // Opportunity Details tab
          await extractOpportunityDetailsData();
          // Also get data from Request Form tab
          try {
            await navigateAndExtract('Request Form');
          } catch (error) {
            console.error('Error extracting Request Form data:', error);
          }
        } else if (currentTab === 'Request Form') {
          // Request Form tab
          await extractRequestFormData();
          // Also get data from Opportunity Details tab
          try {
            await navigateAndExtract('Opportunity Details');
          } catch (error) {
            console.error('Error extracting Opportunity Details data:', error);
          }
        }
      }
      
      // Remove loading message
      document.body.removeChild(loadingMessage);
      
      // Build form URL and open the form
      const formUrl = buildFormUrl();
      createOverlay(formUrl);
      
      console.log('Extracted Data:', extractedData); // For debugging
    } catch (error) {
      console.error('Error in bookmarklet:', error);
      alert('Error: ' + error.message);
    }
  }
  
  // Start execution
  main();
})();
