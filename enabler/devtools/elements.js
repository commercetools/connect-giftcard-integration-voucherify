const createRedeemButton = (component) => {
  const redeemButton = document.createElement('button');
  redeemButton.type = 'submit';
  redeemButton.textContent = 'REDEEM';
  redeemButton.className = 'btn btn-md btn-primary btn-block col-md-6';

  redeemButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const termsChecked = document.getElementById('termsCheckbox').checked;
    if (!termsChecked) {
      event.preventDefault();
      alert('You must agree to the terms and conditions.');
      return;
    }

    const amount = prompt('Enter amount to be redeemed as cent, please bear in mind currency is hardcoded as USD', 1000);

    // TODO: try to set amount as string and see what happens;
    // // validate input redeem amount
    // if (isNaN(parseFloat(redeemAmountValue)) || !isFinite(redeemAmountValue)) {
    //   event.preventDefault();
    //   alert('The redeem amount is not in a valid format');
    //   return;
    // }
    const giftCardRedeemAmount = {
      centAmount: amount,
      currencyCode: 'USD',
    };

    await component.submit({
      amount: giftCardRedeemAmount,
    });
  });

  return redeemButton;
}

const createBalanceButton = (component) => {
  const balanceButton = document.createElement('button');

  balanceButton.textContent = 'APPLY GIFT CARD';
  balanceButton.className = 'btn btn-md btn-primary btn-block col-md-6';
  balanceButton.type = 'submit';

  balanceButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const termsChecked = document.getElementById('termsCheckbox').checked;
    if (!termsChecked) {
      event.preventDefault();
      alert('You must agree to the terms and conditions.');
      return;
    }

    const balanceResponse = await component.balance();

    responseContainer.className = 'p-4 bg-white rounded shadow-sm border text-start';
    responseContainer.innerHTML = `<pre class="mb-0">${JSON.stringify(balanceResponse, null, 2)}</pre>`;

    // Create the Pay or redeem button, when pay button is clicked, render a prompt to accept amount
    // Move this into another function, in the dev tools file actually all the scripts should be moved there
    if (balanceResponse.status.state === 'Valid') {
      const redeemButton = createRedeemButton(component);

      buttonContainer.removeChild(balanceButton);
      buttonContainer.appendChild(redeemButton);
    }
    return;
  });

  return balanceButton;
}

const createCheckBox = () => {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'termsCheckbox';
  checkbox.className = 'form-check-input';

  // Create the label for the checkbox
  const label = document.createElement('label');
  label.htmlFor = 'termsCheckbox';
  label.textContent = 'I agree to the terms and conditions';
  label.className = 'form-check-label';

  // Create a div to wrap the checkbox and label
  const div = document.createElement('div');
  div.className = 'form-check';

  // Append the checkbox and label to the wrapping div
  div.appendChild(checkbox);
  div.appendChild(label);

  return div;
}