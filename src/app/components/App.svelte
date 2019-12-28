<script>
  import queryString from 'query-string';
  import { onMount } from 'svelte';

  const { protocol, hostname, port } = window.location;
  const serviceUrl = `${protocol}//${hostname}:${port}/v1`;
  const headers = {
    Accept: 'application/json,text/plain',
    'Content-Type': 'application/json;charset=UTF-8',
  };

  const newUser = {
    confirmPassword: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  };

  const existingUser = {
    email: '',
    password: '',
  };

  let user;

  onMount(() => {
    fetch(`${serviceUrl}/auth/check`, {
      headers,
      method: 'GET',
    })
      .then(async(res) => {
        if (res.ok) {
          user = await res.json();
        }
      });
  });

  function onCreateUser() {
    const { confirmPassword, email, firstName, lastName, password } = newUser;

    if (!email || !firstName || !lastName || !password || password !== confirmPassword) {
      return;
    }

    fetch(`${serviceUrl}/auth/signup?${queryString.stringify({ firstName, lastName })}`, {
      body: JSON.stringify({ email, password }),
      headers,
      method: 'POST',
    })
      .then(async(res) => {
        if (res.ok) {
          user = await res.json();
        }
      });
  }

  function onSignIn() {
    const { email, password } = existingUser;

    if (!email || !password) {
      return;
    }

    fetch(`${serviceUrl}/auth/login`, {
      body: JSON.stringify({ email, password }),
      headers,
      method: 'POST',
    })
      .then(async(res) => {
        if (res.ok) {
          user = await res.json();
        }
      });
  }

  function onSignOut() {
    fetch(`${serviceUrl}/auth/logout`, { headers, method: 'POST' })
      .then((res) => {
        if (res.ok) {
          user = null;
        }
      });
  }
</script>

<div>
  {#if user}
    <div on:click={onSignOut}>Sign Out</div>
  {:else}
    <div>
      <h1>Create User</h1>
      <input placeholder="First Name" type="text" bind:value={newUser.firstName} />
      <input placeholder="Last Name" type="text" bind:value={newUser.lastName} />
      <input placeholder="Email" type="text" bind:value={newUser.email} />
      <input placeholder="Password" type="password" bind:value={newUser.password} />
      <input placeholder="Confirm Password" type="password" bind:value={newUser.confirmPassword} />
      <div on:click={onCreateUser}>Add</div>
      <h1>Sign In</h1>
      <input placeholder="Email" type="text" bind:value={existingUser.email} />
      <input placeholder="Password" type="password" bind:value={existingUser.password} />
      <div on:click={onSignIn}>Login</div>
    </div>
  {/if}
</div>
