<template>
  <div class="not-found">
    <div class="not-found__content">
      <div class="not-found__icon">🎂</div>
      <h1 class="not-found__title">404</h1>
      <p class="not-found__desc">抱歉，您访问的页面不存在</p>
      <router-link to="/" class="not-found__btn">返回首页</router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.not-found {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;

  &__content {
    text-align: center;
    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  &__icon {
    font-size: 80px;
    margin-bottom: 24px;
  }

  &__title {
    font-family: 'Playfair Display', serif;
    font-size: 120px;
    font-weight: 700;
    color: #1a1f36;
    line-height: 1;
    margin-bottom: 16px;
    letter-spacing: -0.04em;
  }

  &__desc {
    font-size: 18px;
    color: #9a9a9a;
    margin-bottom: 40px;
  }

  &__btn {
    display: inline-flex;
    padding: 14px 36px;
    background: #1a1f36;
    color: #fff;
    border-radius: 40px;
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(26, 31, 54, 0.2);
    }
  }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
