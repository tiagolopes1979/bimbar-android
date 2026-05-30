// Plugin definitions for Capacitor
export default [
  {
    name: 'SecurityChecker',
    plugins: [
      {
        name: 'checkDevice',
        platform: 'android'
      }
    ]
  },
  {
    name: 'RootChecker',
    plugins: [
      {
        name: 'checkSu',
        platform: 'android'
      },
      {
        name: 'checkPaths',
        platform: 'android'
      }
    ]
  },
  {
    name: 'PackageChecker',
    plugins: [
      {
        name: 'checkPackages',
        platform: 'android'
      }
    ]
  }
]