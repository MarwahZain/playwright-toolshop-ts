@bdd @regression
Feature: Login
  As a customer
  I want to log in with my email and password
  So that I can see my account and check out faster

  # BDD version of tests/ui/guest/login.spec.ts, kept side by side for learning.

  Background:
    Given I am on the login page

  @bdd @regression @readonly
  Scenario: A customer logs in with valid credentials
    When I log in as the customer
    Then I see my account page
    And the menu shows the customer's name

  # Not @readonly: a wrong password counts towards locking the account on a shared environment.
  @bdd @regression @fixme
  Scenario: A wrong password is rejected
    When I log in as "customer3@practicesoftwaretesting.com" with the password "WrongPassword123"
    Then I see the login error "Invalid email or password"
    And I am still on the login page

  @bdd @regression @readonly
  Scenario Outline: A missing field is reported before anything is sent
    When I log in as "<email>" with the password "<password>"
    Then I see the <field> error "<message>"

    Examples:
      | email                                | password  | field    | message              |
      |                                      | welcome01 | email    | Email is required    |
      | customer@practicesoftwaretesting.com |           | password | Password is required |

  @bdd @regression @readonly
  Scenario: Submitting an empty form reports both fields
    When I submit the login form without filling it in
    Then I see the email error "Email is required"
    And I see the password error "Password is required"
