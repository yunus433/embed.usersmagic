let unsavedChanges = false;
let isSaving = false;

function throwSaveButtonError(errorText) {
  isSaving = false;
  document.getElementById('settings-save-changes-button').innerHTML = 'Save';
  document.getElementById('settings-save-changes-button').style.cursor = 'pointer';
  document.querySelector('.settings-unsaved-changes-text').style.display = 'none';
  document.querySelector('.settings-save-error').style.display = 'initial';
  document.querySelector('.settings-save-error').innerHTML = errorText;
}

function createTeamMember(id) {
  serverRequest('/settings/team?id=' + id, 'GET', {}, res => {
    if (!res.success)
      return throwError(res.error);

    team.push(res.user);

    const member = document.createElement('div');
    member.classList.add('each-team-member');
    member.id = res.user._id.toString();

    const memberEmail = document.createElement('span');
    memberEmail.classList.add('each-team-member-email');
    memberEmail.innerHTML = res.user.email;
    member.appendChild(memberEmail);

    const memberRole = document.createElement('span');
    memberRole.classList.add('each-team-member-role');
    memberRole.innerHTML = res.user.company_role;
    member.appendChild(memberRole);

    if (user._id.toString() != res.user._id.toString() && (user.company_role == 'admin' || user.company_role == 'manager') && res.user.company_role != 'admin') {
      const deleteButton = document.createElement('i');
      deleteButton.classList.add('fas');
      deleteButton.classList.add('fa-trash-alt');
      deleteButton.classList.add('each-team-member-delete-button');
      member.appendChild(deleteButton);
    }

    document.querySelector('.settings-team-wrapper').appendChild(member);
  });
}

window.addEventListener('load', () => {
  document.addEventListener('input', event => {
    if (event.target.classList.contains('general-settings-input')) {
      unsavedChanges = true;
      document.querySelector('.settings-unsaved-changes-text').style.display = 'initial';
      document.querySelector('.settings-save-error').style.display = 'none';
      document.getElementById('settings-save-changes-button').style.cursor = 'pointer';
      document.getElementById('settings-save-changes-button').innerHTML = 'Save';
      document.getElementById('settings-save-changes-button').classList.remove('all-content-inner-header-open-form-button-not-allowed');
    }
  });

  document.addEventListener('click', event => {
    if (event.target.id == 'settings-save-changes-button' && !isSaving && unsavedChanges) {
      isSaving = true;
      document.querySelector('.settings-unsaved-changes-text').style.display = 'none';
      document.querySelector('.settings-save-error').style.display = 'none';
      event.target.innerHTML = 'Saving...';
      event.target.style.cursor = 'progress';

      const data = {};
      const name = document.getElementById('user-name-input').value;

      data.name = name ? name : '';

      if (user.company_role == 'manager' || user.company_role == 'admin') {
        const companyName = document.getElementById('company-name-input').value;
        const companyColor = document.getElementById('company-color-input').value;

        if (!companyName || !companyName.length)
          return throwSaveButtonError('Please write a company name.');

        if (!companyColor || !companyColor.length)
          return throwSaveButtonError('Please write a company color.');

        data.company_name = companyName;
        data.preferred_color = companyColor;
      }

      serverRequest('/settings/update', 'POST', data, res => {
        if (!res.success)
          return throwError(res.error);

        const password = document.getElementById('password-input').value;
        const confirmPassword = document.getElementById('confirm-password-input').value;
        const oldPassword = document.getElementById('old-password-input').value; 

        if (!password || !password.length) {
          isSaving = false;
          unsavedChanges = false;
          document.querySelector('.settings-unsaved-changes-text').style.display = 'none';
          document.querySelector('.settings-save-error').style.display = 'none';
          event.target.innerHTML = 'Saved';
          event.target.classList.add('all-content-inner-header-open-form-button-not-allowed');
          event.target.style.cursor = 'not-allowed';
          return;
        }

        if (password.length < 6)
          return throwSaveButtonError('Your new password must be at least 6 digits long.');

        if (!confirmPassword || confirmPassword != password)
          return throwSaveButtonError('Please confirm your new password.');

        if (!oldPassword || !oldPassword.length)
          return throwSaveButtonError('Please write your old password.');

        serverRequest('/settings/password', 'POST', {
          password,
          old_password: oldPassword
        }, res => {
          console.log(res);
          if (!res.success && res.error == 'password_verification')
            return throwSaveButtonError('Your password is not correct.');
          if (!res.success)
            return throwError(res.error);

          document.getElementById('password-input').value = '';
          document.getElementById('confirm-password-input').value = '';
          document.getElementById('old-password-input').value = '';

          isSaving = false;
          unsavedChanges = false;
          document.querySelector('.settings-unsaved-changes-text').style.display = 'none';
          document.querySelector('.settings-save-error').style.display = 'none';
          event.target.innerHTML = 'Saved';
          event.target.style.cursor = 'not-allowed';
          event.target.classList.add('all-content-inner-header-open-form-button-not-allowed');
        });
      });
    }

    if (event.target.classList.contains('settings-team-add-new-button') || event.target.parentNode.classList.contains('settings-team-add-new-button')) {
      document.querySelector('.settings-team-add-new-button').style.display = 'none';
      document.querySelector('.settings-team-add-new-inputs-wrapper').style.display = 'initial';
    }

    if (event.target.classList.contains('settings-team-back-button')) {
      document.querySelector('.settings-team-add-new-button').style.display = 'flex';
      document.querySelector('.settings-team-add-new-inputs-wrapper').style.display = 'none';
    }

    if (event.target.classList.contains('settings-team-create-button')) {
      const email = document.getElementById('team-member-email-input').value;
      const role = document.getElementById('team-member-role-input').value;
      const password = document.getElementById('team-member-password-input').value;
      const confirmPassword = document.getElementById('team-member-confirm-password-input').value;
      
      const error = document.querySelector('.settings-team-invite-error');
      
      if (!email || !email.length)
        return error.innerHTML = 'Please write an email for the new member.';

      if (!role || !role.length)
        return error.innerHTML = 'Please choose a role for the new member.';

      if (!password || !password.length)
        return error.innerHTML = 'Please write a password for the new member.';

      if (password.length < 6)
        return error.innerHTML = 'The password must be at least 6-digits long.';

      if (password != confirmPassword)
        return error.innerHTML = 'Please confirm the password.';

      serverRequest('/settings/team/invite', 'POST', {
        email,
        password,
        company_role: role
      }, res => {
        if (!res.success && res.error == 'email_validation')
          return error.innerHTML = 'Please enter a valid email.';

        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'A user with this email address already exists.';

        if (!res.success)
          return throwError(res.error);

        createTeamMember(res.id);
        error.innerHTML = '';
        document.getElementById('team-member-email-input').value = '';
        document.getElementById('team-member-role-input').value = '';
        document.getElementById('team-member-password-input').value = '';
        document.getElementById('team-member-confirm-password-input').value = '';
        document.getElementById('team-member-role-input-text').innerHTML = 'Click to choose';
        document.getElementById('team-member-role-input-text').style.color = 'rgb(98, 98, 103, 0.35)';
        document.querySelector('.settings-team-add-new-inputs-wrapper').style.display = 'none';

        if (team.length < 4)
          document.querySelector('.settings-team-add-new-button').style.display = 'flex';
      });
    }

    if (event.target.classList.contains('each-team-member-delete-button')) {
      createConfirm({
        title: 'Are you sure you want to delete this account?',
        text: 'You cannot take back this action.',
        accept: 'Delete',
        reject: 'Cancel'
      }, res => {
        if (!res) return;

        const id = event.target.parentNode.id;

        serverRequest('/settings/team/delete?id=' + id, 'GET', {}, res => {
          if (!res.success)
            return throwError(res.error);

          event.target.parentNode.remove();
          team = team.filter(each => each._id.toString() != id);
        });
      });
    }
  });
});

window.onbeforeunload = () => {
  if (unsavedChanges)
    return 'You have unsaved changes. Do you want to leave the page before saving them?';
};
