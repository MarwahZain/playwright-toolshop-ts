@bdd @regression
Feature: Product search

  Background:
    Given I am on the homepage

  @bdd @regression @readonly
  Scenario Outline: Search shows only matching products
    When I search for "<product>"
    Then I should see results for "<product>"
    And The summary says <count> products found for "<product>"

    @smoke
    Examples: smoke
      | product | count |
      | Hammer  |     6 |

    Examples: Regression
      | product | count |
      | Saw     |     2 |
      | Bolt    |     2 |

  @bdd @regression @readonly
  Scenario: Search with no matches shows a message
    When I search for "Headphone"
    #Then I should see no results with a message "There are no products found."
    And The summary says 0 products found for "Headphone"
